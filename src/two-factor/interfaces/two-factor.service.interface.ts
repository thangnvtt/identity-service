import { UserEntity } from 'src/users/entities'
export interface ITwoFactorAuthService {
	generateTwoFactorAuthenticationSecret(id: string): Promise<string>
	generateQrCode(user: UserEntity): Promise<string>
	isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, twoFactorAuthenticationSecret: string): Promise<any>
	turnOnTwoFactor(id: string): Promise<UserEntity>
	turnOffTwoFactor(id: string): Promise<UserEntity>
	// signInWith2FA(user: any): Promise<any>
}

export const TWO_FACTOR_AUTH = 'TWO FACTOR AUTH'
