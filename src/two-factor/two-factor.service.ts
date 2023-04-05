import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { authenticator } from 'otplib'
import { IUserRepository, USER_REPOSITORY } from 'src/users/interfaces/users.repositories.interface'
import { UserErrorMessage } from 'src/wallet-provider/constants'
import { ITwoFactorAuthService } from './interfaces/two-factor.service.interface'
import { toDataURL } from 'qrcode'
import { UserEntity } from 'src/users/entities/user.entity'

@Injectable()
export class TwoFactorAuthService implements ITwoFactorAuthService {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository, private readonly configService: ConfigService) {}
	async generateTwoFactorAuthenticationSecret(id: string): Promise<string> {
		const user = await this.userRepository.findById(id)
		if (!user) throw new NotFoundException(UserErrorMessage.NOT_FOUND)

		const secret = authenticator.generateSecret(24)

		await this.userRepository.update(id, { twoFactorAuthenticationSecret: secret })
		return secret
	}

	async generateQrCode(user: UserEntity): Promise<string> {
		const otpAuthUrl = authenticator.keyuri(user.email, this.configService.get('AUTH_2FA_NAME'), user.twoFactorAuthenticationSecret)
		return toDataURL(otpAuthUrl)
	}

	async isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, twoFactorAuthenticationSecret: string) {
		return authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: twoFactorAuthenticationSecret,
		})
	}

	turnOnTwoFactor(id: string): Promise<UserEntity> {
		return this.userRepository.update(id, { isEnableTwoFactor: true })
	}

	async turnOffTwoFactor(id: string): Promise<UserEntity> {
		return this.userRepository.update(id, { isEnableTwoFactor: false, twoFactorAuthenticationSecret: '' })
	}

	// async signInWith2FA(user: UserEntity) {
	// 	let isTwoFactorAuthenticated = true
	// 	if (user.isEnableTwoFactor == false) isTwoFactorAuthenticated = false
	// 	const payload = {
	// 		isTwoFactorAuthenticated,
	// 		...user,
	// 	}
	// 	const token = jwt.sign(payload, this.configService.get('SECRET_KEY_JWT_2FA'))

	// 	await this.userRepository.update(user.id, { signed_in_at: Date.now() })
	// 	return {
	// 		jwt: token,
	// 	}
	// }
}
