export class UpdateUser {
	firstName?: string
	lastName?: string
	nickName?: string
	avatar?: string
	birthday?: number
	status?: string
	resetPasswordToken?: string
	oldPassword?: string
	newPassword?: string
	tfaCode?: string
	signedInAt?: number
}

export class Password2fa {
	password?: string
	twoFactorCode?: string
}

export interface ConfirmationCode {
	code: string
	userId: string
}
