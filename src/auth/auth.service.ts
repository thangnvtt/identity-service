import { BadRequestException, CACHE_MANAGER, Inject, Injectable, Logger, PayloadTooLargeException } from '@nestjs/common'
import { SignWalletResponsive } from 'src/wallet-provider/interfaces/responses.interface'
import { FIREBASE_ADMIN_SERVICE, IFirebaseAdminService } from 'src/firebase/interfaces/firebase-admin.interface'
import { IWalletProviderService, WALLET_PROVIDER_SERVICE } from 'src/wallet-provider/interfaces/wallet-provider.interface'
import * as JWT from 'jsonwebtoken'
import { ConfigService } from '@nestjs/config'
import {
	AUTH_REPOSITORY,
	IAuthRepository,
	IAuthService,
	JSON_WEB_TOKEN_SERVICE,
	JwtOtpTwoFactorPayload,
	JwtResetPwdBody,
	TimeBaseOtpOptions,
} from './interfaces'
import { AuthUserEntity, ConfirmUserEvent, ConfirmUserEventName, ResetPasswordEvent, ResetPasswordEventName } from './entities'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { REDIS_PREFIX } from 'src/constants'
import { Cache } from 'cache-manager'
import { AuthErrorMessage, EmailVerificationErrorMessage, ResetPasswordErrorMessage } from './constants'
import { FIREBASE_CLIENT_SERVICE, IFirebaseClientService } from 'src/firebase/interfaces'
import { JsonWebTokenService } from './jwt.service'
import * as moment from 'moment'
import { UserEntity } from 'src/users/entities'
import { totp } from 'otplib'
import { IUserService, USER_SERVICES } from 'src/users/interfaces/user.service.interface'
@Injectable()
export class AuthService implements IAuthService {
	private readonly logger = new Logger(AuthService.name)

	private readonly resetPwdTokenPrivateKey: string

	private readonly expiredInResetPwd: string

	private readonly redisResetPwdTtl: number

	private readonly twoFactorTokenExpiredIn: number

	private readonly authSalt: string

	private tOTPDigits: number

	private tOTPStepTime: number

	private codeEmailVerificationExpiredIn: number

	constructor(
		@Inject(WALLET_PROVIDER_SERVICE)
		private readonly walletProviderService: IWalletProviderService,

		@Inject(FIREBASE_ADMIN_SERVICE)
		private readonly firebaseAdminService: IFirebaseAdminService,

		@Inject(AUTH_REPOSITORY)
		private readonly authRepository: IAuthRepository,

		@Inject(CACHE_MANAGER)
		private readonly cacheService: Cache,

		@Inject(FIREBASE_CLIENT_SERVICE)
		private readonly firebaseClientService: IFirebaseClientService,

		@Inject(JSON_WEB_TOKEN_SERVICE)
		private readonly jsonWebTokenService: JsonWebTokenService,

		@Inject(USER_SERVICES)
		private readonly userService: IUserService,

		private readonly configService: ConfigService,

		private readonly evenEmitter: EventEmitter2,
	) {
		this.resetPwdTokenPrivateKey = this.configService.get<string>('RESET_PASSWORD_PRIVATE_KEY')
		this.expiredInResetPwd = this.configService.get<string>('EXPIRED_IN_RESET_PASSWORD')
		this.redisResetPwdTtl = this.configService.get<number>('REDIS_RESET_PASSWORD_TTL')
		this.twoFactorTokenExpiredIn = this.configService.get<number>('TWO_FACTOR_TOKEN_EXPIRED_IN')
		this.authSalt = this.configService.get<string>('AUTH_SALT')
		this.tOTPDigits = this.configService.get<number>('NUMBER_DIGITS')
		this.tOTPStepTime = this.configService.get<number>('TLS_VERIFICATION_CODE')
		this.codeEmailVerificationExpiredIn = this.configService.get<number>('CODE_EMAIL_VERIFICATION_EXPIRED_IN')
	}

	verifyCodeEmail(user: AuthUserEntity, opt: string): boolean {
		const secretKey = this.generateSecretKey(user)
		return this.verifyTimeBaseOTP(secretKey, opt)
	}

	private getKeyRedisSendCodeVerifyEmail(user: AuthUserEntity) {
		return `email_code_verification_sent:${user.id}:${user.email}`
	}

	async sendEmailVerification(user: AuthUserEntity): Promise<boolean> {
		const code = this.generateTimeBaseOTP(user, {
			digits: this.tOTPDigits,
			stepTime: this.codeEmailVerificationExpiredIn,
		})
		const redisKey = this.getKeyRedisSendCodeVerifyEmail(user)
		const isSentEmail = await this.cacheService.get(redisKey)

		if (isSentEmail) throw new BadRequestException(EmailVerificationErrorMessage.EMAIL_HAS_BEEN_SENT)
		const payload: ConfirmUserEvent = {
			email: user.email,
			code,
			nickName: user.nickName,
		}

		await this.evenEmitter.emit(ConfirmUserEventName, payload)
		await this.cacheService.set(redisKey, true, { ttl: this.codeEmailVerificationExpiredIn })
		return true
	}

	generateSecretKey(payload: AuthUserEntity): string {
		return `${JSON.stringify(payload)}${this.authSalt}`
	}

	verifyTimeBaseOTP(secretKey: string, otp: string): boolean {
		return totp.check(otp, secretKey)
	}

	generateTimeBaseOTP(payload: AuthUserEntity, options?: TimeBaseOtpOptions): string {
		totp.options = {
			digits: options && options.digits ? Number(options.digits) : Number(this.tOTPDigits),
			step: options && options.stepTime ? Number(options.stepTime) : Number(this.tOTPStepTime),
		}
		const secretKey = this.generateSecretKey(payload)
		return totp.generate(secretKey)
	}

	generateTwoFactorToken(user: UserEntity): Promise<string> {
		const payload: JwtOtpTwoFactorPayload = {
			id: user.id,
			iat: moment().unix(),
			isEnableTwoFactor: user.isEnableTwoFactor,
			exp: moment()
				.add(this.twoFactorTokenExpiredIn * 1000, 'milliseconds')
				.unix(),
		}
		if (!user.isEnableTwoFactor) {
			payload.exp = moment().add(1, 'days').unix()
		}
		return this.jsonWebTokenService.sign(payload)
	}

	generateOtpToken(payload: any): Promise<string> {
		return this.jsonWebTokenService.sign(payload)
	}

	private genResetPasswordKey(email: string) {
		return `${REDIS_PREFIX}:reset-password:${email}`
	}

	generateTokenResetPassword(email: string): string {
		const body: JwtResetPwdBody = { email }
		return JWT.sign(body, this.resetPwdTokenPrivateKey, { expiresIn: this.expiredInResetPwd })
	}

	async sendEmailResetPassword(user: UserEntity): Promise<boolean> {
		if (!user.email) return false
		const redisKey = this.genResetPasswordKey(user.email)
		await this.cacheService.set(redisKey, false)

		const token = this.generateTokenResetPassword(user.email)
		const event: ResetPasswordEvent = { token, email: user.email, nickName: user.nickName }
		return this.evenEmitter.emit(ResetPasswordEventName, event)
	}

	async resetPassword(token: string, newPassword: string): Promise<void> {
		try {
			const decode = <JwtResetPwdBody>JWT.verify(token, this.resetPwdTokenPrivateKey)
			const redisKey = this.genResetPasswordKey(decode.email)
			const isReset = await this.cacheService.get(redisKey)
			if (isReset) throw new BadRequestException(ResetPasswordErrorMessage.HAS_BEEN_RESET_PASSWORD)

			const user = await this.firebaseAdminService.getUserByEmail(decode.email)
			await this.firebaseAdminService.updateUser(user.uid, { password: newPassword, emailVerified: true })
			await this.cacheService.set(redisKey, true, { ttl: this.redisResetPwdTtl })
		} catch (err) {
			if (err instanceof JWT.TokenExpiredError) {
				throw new BadRequestException(ResetPasswordErrorMessage.EXPIRED_LINK)
			}
			throw err
		}
	}

	async changePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
		const user = await this.firebaseClientService.signInWithEmailAndPassword(email, currentPassword)
		await this.firebaseAdminService.updateUser(user.uid, { password: newPassword })
	}

	async adminSignIn(identifier: string, password: string): Promise<AuthUserEntity> {
		return this.authRepository.adminSignIn(identifier, password)
	}

	async adminSignUp(user: AuthUserEntity): Promise<AuthUserEntity> {
		return this.authRepository.adminCreateUser(user)
	}

	async notify(user: AuthUserEntity): Promise<void> {
		await this.authRepository.notify(user)
		this.logger.log(`Publish successfully ${JSON.stringify(user)}`)
	}

	async verifyUser(id: string, code: string): Promise<UserEntity> {
		const user = await this.userService.findById(id)
		if (!user.email) throw new BadRequestException(AuthErrorMessage.INVALID_EMAIL)

		const check = this.checkOtpForVerification(id, code)
		if (!check) throw new BadRequestException(AuthErrorMessage.INVALID_TWO_FACTOR)

		await this.firebaseAdminService.updateUser(id, { emailVerified: true, disabled: false })
		return this.userService.update(id, {
			verifiedAt: moment().unix(),
		})
	}

	async createUserViaWallet(address: string): Promise<number> {
		return this.walletProviderService.createFirebaseUser(address)
	}

	async signWallet(address: string, signature: string): Promise<SignWalletResponsive> {
		return this.walletProviderService.signWallet(address, signature)
	}

	checkOtpForVerification(id: string, code: string): boolean {
		const hashedId = this.userService.getHash(id)
		return totp.check(code, hashedId)
	}
}
