export interface ResetPasswordEvent {
	token: string
	email: string
	nickName: string
}
export const ResetPasswordEventName = 'auth.resetPassword'

export interface ConfirmUserEvent {
	nickName: string
	email: string
	code: string
}
export const ConfirmUserEventName = 'auth.confirmUser'
