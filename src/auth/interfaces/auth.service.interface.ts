import { UserEntity } from 'src/users/entities'
import { SignWalletResponsive } from 'src/wallet-provider/interfaces/responses.interface'
import { AuthUserEntity } from '../entities/user.entity'

export interface TimeBaseOtpOptions {
	digits: number
	stepTime: number
}
export interface JwtOtpTwoFactorPayload {
	id: string
	exp: number
	iat: number
	isEnableTwoFactor: boolean
}
export interface JwtResetPwdBody {
	email: string
}
export interface IAuthService {
	createUserViaWallet(address: string): Promise<number>

	signWallet(address: string, signature: string): Promise<SignWalletResponsive>

	verifyUser(id: string, code: string): Promise<UserEntity>

	notify(user: AuthUserEntity): Promise<void>

	adminSignUp(user: AuthUserEntity): Promise<AuthUserEntity>

	adminSignIn(identifier: string, password: string): Promise<AuthUserEntity>

	sendEmailResetPassword(user: UserEntity): Promise<boolean>

	resetPassword(token: string, newPassword: string): Promise<void>

	changePassword(email: string, currentPassword: string, newPassword: string): Promise<void>

	generateOtpToken(payload: any): Promise<string>

	generateTwoFactorToken(user: UserEntity): Promise<string>

	checkOtpForVerification(id: string, code: string): boolean

	generateTimeBaseOTP(payload: AuthUserEntity, options?: TimeBaseOtpOptions): string

	verifyTimeBaseOTP(secretKey: string, otp: string): boolean

	sendEmailVerification(user: AuthUserEntity): Promise<boolean>

	verifyCodeEmail(user: AuthUserEntity, otp: string): boolean
}

export const AUTH_SERVICE = 'AUTH SERVICE'
