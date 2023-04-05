import { Body, Controller, Inject, Post, Put, UseGuards, Request, Get, Req, BadRequestException, UnauthorizedException, Query } from '@nestjs/common'
import { TwoFactorAuthGuard } from 'src/guards/two-factor.guard'
import { Roles } from 'src/guards/role.decorator'
import { Role } from 'src/guards/role.guard'
import { BaseRequest } from 'src/interfaces/common.interface'
import { ITwoFactorAuthService, TWO_FACTOR_AUTH } from 'src/two-factor/interfaces/two-factor.service.interface'
import { CreateUserWalletDto } from './dto/create-user-wallet.dto'
import { SignWalletDto } from './dto/sign-wallet.dto'
import { VerifyUserDto } from './dto/verify-user.dto'
import { AUTH_SERVICE, IAuthService } from './interfaces/auth.service.interface'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { FIREBASE_ADMIN_SERVICE, IFirebaseAdminService } from 'src/firebase/interfaces'
import { IUserService, USER_SERVICES } from 'src/users/interfaces/user.service.interface'
import { AuthErrorMessage, EmailVerificationErrorMessage } from './constants'
import { AuthorizeErrorMessage, SignInErrorMessage } from 'src/firebase/constants'
import { VerifyTwoFactorDto } from './dto/verify-two-factor.dto'
import { AuthUserEntity } from './entities'
import { VerifyEmailDto } from './dto/verify-email.dto'
import { LinkEmailDto } from './dto/link-email.dto'
import * as moment from 'moment'

@Controller('auth')
export class AuthController {
	constructor(
		@Inject(AUTH_SERVICE)
		private readonly authService: IAuthService,

		@Inject(TWO_FACTOR_AUTH)
		private readonly twoFactorAuthService: ITwoFactorAuthService,

		@Inject(FIREBASE_ADMIN_SERVICE)
		private readonly firebaseAdminService: IFirebaseAdminService,

		@Inject(USER_SERVICES)
		private readonly userService: IUserService,
	) {}

	@Post('wallet/register')
	createUserViaWallet(@Body() createUserWalletDto: CreateUserWalletDto) {
		const { address } = createUserWalletDto
		return this.authService.createUserViaWallet(address)
	}

	@Post('wallet/sign')
	signWallet(@Body() signWalletDto: SignWalletDto) {
		const { address, signature } = signWalletDto
		return this.authService.signWallet(address, signature)
	}

	@Post('confirmation')
	verifyUser(@Req() req: BaseRequest, @Body() verifyUserDto: VerifyUserDto) {
		const id = req.user.id
		const { code } = verifyUserDto
		return this.authService.verifyUser(id, code)
	}

	@Get('2fa/qr-code')
	@Roles(Role.USER)
	async generate(@Request() request: BaseRequest) {
		const user = await this.userService.findById(request.user.id)
		let secret = ''
		if (!user.twoFactorAuthenticationSecret || user.twoFactorAuthenticationSecret.length == 0) {
			secret = await this.twoFactorAuthService.generateTwoFactorAuthenticationSecret(user.id)
		} else secret = user.twoFactorAuthenticationSecret
		user.twoFactorAuthenticationSecret = secret
		return { secret }
	}

	@Put('2fa/turn-on')
	@UseGuards(TwoFactorAuthGuard)
	async turnOnTwoFactor(@Request() request: BaseRequest) {
		const user = request.user
		return this.twoFactorAuthService.turnOnTwoFactor(user.id)
	}

	@Put('2fa/turn-off')
	@UseGuards(TwoFactorAuthGuard)
	async turnOffTwoFactor(@Request() request: BaseRequest) {
		const user = request.user
		return this.twoFactorAuthService.turnOffTwoFactor(user.id)
	}

	@Post('2fa/sign')
	async verifyAndGenerateToken(@Body() verifyTwoFactorDto: VerifyTwoFactorDto, @Req() request) {
		const { twoFactorCode } = verifyTwoFactorDto
		const user = request.user
		if (!user) throw new UnauthorizedException()

		const userEntity = await this.userService.findById(user.id)
		if (userEntity.isEnableTwoFactor) {
			if (!twoFactorCode) {
				throw new BadRequestException(SignInErrorMessage.MISSING_TWO_FACTOR_PASSWORD)
			}
			const isValid = await this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
				twoFactorCode,
				userEntity.twoFactorAuthenticationSecret,
			)
			if (!isValid) throw new BadRequestException(AuthErrorMessage.INVALID_TWO_FACTOR)
		}

		const token = await this.authService.generateTwoFactorToken(userEntity)
		return { idToken: token }
	}

	@Post('forgot-password')
	async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
		const user = await this.userService.findOne({ email: forgotPasswordDto.email })
		if (!user) return undefined
		return this.authService.sendEmailResetPassword(user)
	}

	@Post('reset-password')
	async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
		return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password)
	}

	@Post('change-password')
	async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() request) {
		const { currentPassword, newPassword, twoFactorCode } = changePasswordDto
		const user = request.user
		if (!user) throw new UnauthorizedException()

		const userEntity = await this.userService.findById(request.user.id)
		if (userEntity.isEnableTwoFactor) {
			const isValid = await this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
				twoFactorCode,
				userEntity.twoFactorAuthenticationSecret,
			)
			if (!isValid) throw new BadRequestException(AuthErrorMessage.INVALID_TWO_FACTOR)
		}

		try {
			const pwdChanged = await this.authService.changePassword(request.user.email, currentPassword, newPassword)
			return pwdChanged
		} catch (err) {
			if (err.message === SignInErrorMessage.WRONG_USERNAME_PASSWORD) {
				throw new BadRequestException(SignInErrorMessage.WRONG_PASSWORD_LOGIN)
			}
			throw err
		}
	}

	@Get('verify-token')
	async verifyToken(@Req() request: any) {
		const headersAuth = request.headers.authorization
		const token = headersAuth && headersAuth.split(' ')[0] === 'Bearer' ? headersAuth.split(' ')[1] : undefined
		if (!token) throw new UnauthorizedException(AuthorizeErrorMessage.MISSING_TOKEN)
		try {
			return this.firebaseAdminService.verifyIdToken(token)
		} catch (err) {
			throw new UnauthorizedException(err.message.split('.')[0])
		}
	}

	@Post('verify-email')
	async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto, @Req() request) {
		const user = request.user
		if (!user) throw new UnauthorizedException()

		const emailExists = await this.userService.findOne({ email: verifyEmailDto.email })
		if (emailExists && emailExists.id !== user.id) throw new BadRequestException(EmailVerificationErrorMessage.EMAIL_EXISTS)

		const userEntity = await this.userService.findById(user.id)
		const authUser: AuthUserEntity = {
			id: userEntity.id,
			email: verifyEmailDto.email,
			identifier: userEntity.identifier,
			nickName: userEntity.nickName,
		}

		return this.authService.sendEmailVerification(authUser)
	}

	@Post('link-email')
	async linkEmail(@Body() linkEmailDto: LinkEmailDto, @Req() request) {
		const user = request.user
		if (!user) throw new UnauthorizedException()

		const userEntity = await this.userService.findById(user.id)
		if (userEntity.linkEmailAt) throw new BadRequestException(EmailVerificationErrorMessage.HAS_BEEN_REGISTERED_EMAIL)

		const authUser: AuthUserEntity = {
			id: userEntity.id,
			email: linkEmailDto.email,
			identifier: userEntity.identifier,
			nickName: userEntity.nickName,
		}
		const isValidCode = this.authService.verifyCodeEmail(authUser, linkEmailDto.code)
		if (!isValidCode) throw new BadRequestException(EmailVerificationErrorMessage.INVALID_CODE)

		await Promise.all([
			this.firebaseAdminService.updateUser(userEntity.id, { password: linkEmailDto.password }),
			this.userService.update(userEntity.id, { linkEmailAt: moment().unix() }),
		])
		return true
	}
}
