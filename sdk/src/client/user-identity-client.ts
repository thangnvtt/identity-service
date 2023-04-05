import { Base } from '../common'
import { ChangePasswordBody, Password2fa, ResetPasswordBody } from '../dto'
import { LinkEmailDto } from '../dto/link-email.dto'
import { QrCodeAndSecret, UserEntity } from '../entities'

export interface Responsive<T> {
	data: T
	meta: {
		page?: number
		pageSize?: number
		totalRecord?: number
		totalPage?: number
	}
}

export class UserIdentityClient extends Base {
	/**
	 * Send email to user to reset password
	 * @param email
	 * @returns true if success
	 */
	async forgotPassword(email: string): Promise<Responsive<boolean>> {
		await this.api.post('/auth/forgot-password', { email })
		return {
			data: true,
			meta: {},
		}
	}

	/**
	 * Reset password
	 * @param body
	 * @returns true if success
	 */
	async resetPassword(body: ResetPasswordBody): Promise<Responsive<boolean>> {
		await this.api.post('/auth/reset-password', { token: body.token, password: body.newPassword })
		return {
			data: true,
			meta: {},
		}
	}

	/**
	 * Update password
	 * @param body
	 * @returns
	 */
	async changePassword(body: ChangePasswordBody): Promise<Responsive<boolean>> {
		await this.api.post('/auth/change-password', {
			currentPassword: body.oldPassword,
			newPassword: body.newPassword,
			twoFactorCode: body.tfaCode,
		})
		return {
			data: true,
			meta: {},
		}
	}

	/**
	 * create qr code and secret for 2fa
	 * @returns QrCodeAndSecret
	 */
	async createQrCodeAndSecretKey(): Promise<QrCodeAndSecret> {
		const res = await this.api.get('auth/2fa/qr-code')
		return <QrCodeAndSecret>res.data
	}

	/**
	 * Enable two factor authentication
	 * @param data
	 * @returns
	 */
	async turnOn2fa(data: Password2fa): Promise<UserEntity> {
		const res = await this.api.put('auth/2fa/turn-on', data)
		return <UserEntity>res.data
	}

	/**
	 * Disable two factor authentication
	 * @param data
	 * @returns
	 */
	async turnOff2fa(data: Password2fa): Promise<boolean> {
		const res = await this.api.put('auth/2fa/turn-off', data)
		return res.data
	}

	/**
	 * Confirm user's email
	 * @param code
	 * @returns
	 */
	async confirmUser(code: string): Promise<UserEntity> {
		const res = await this.api.post('auth/confirmation', { code })
		return <UserEntity>res.data
	}

	/**
	 * Send code verify email
	 */
	async sendCodeVerifyEmail(email: string) {
		const res = await this.api.post('auth/verify-email', { email })
		return <UserEntity>res.data
	}

	/**
	 * Link email
	 */
	async linkEmail(body: LinkEmailDto) {
		return true
	}
}
