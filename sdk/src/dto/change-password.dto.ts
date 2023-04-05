export class ChangePasswordBody {
	oldPassword: string
	newPassword: string
	tfaCode?: string

	constructor(oldPassword: string, newPassword: string, tfaCode?: string) {
		this.oldPassword = oldPassword
		this.newPassword = newPassword
		this.tfaCode = tfaCode
	}
}
