export interface IEmailService {
	resetPassword(email: string, link: string, nickName: string): Promise<void>
}
export const EMAIL_SERVICE = 'EMAIL SERVICE'
