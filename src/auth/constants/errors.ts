enum AuthErrorMessage {
	UNAUTHORIZED = 'Unauthorized',
	TFA_CODE_REQUIRED = 'Verification Code is required. Please input this field',
	INVALID_TWO_FACTOR = 'Verification Code is invalid',
	INVALID_EMAIL = 'Email is invalid',
}

enum ResetPasswordErrorMessage {
	HAS_BEEN_RESET_PASSWORD = 'Password has been reset',
	EXPIRED_LINK = 'Session has expired',
}

enum EmailVerificationErrorMessage {
	EMAIL_EXISTS = 'This email has existed. Please try again',
	EMAIL_HAS_BEEN_SENT = 'An email is sent. Please check to get the verification code',
	INVALID_CODE = 'Your verification code is invalid',
	HAS_BEEN_REGISTERED_EMAIL = 'User has been registered email',
}
export { AuthErrorMessage, ResetPasswordErrorMessage, EmailVerificationErrorMessage }
