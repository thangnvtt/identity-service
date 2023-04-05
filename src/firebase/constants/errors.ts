enum SignInErrorMessage {
	SCAN_QR_CODE = 'Please scan qr code to get password',
	MISSING_PASSWORD_LOGIN = 'Login Password is required. Please input this field',
	MISSING_TWO_FACTOR_PASSWORD = 'Verification Code is required. Please input this field',
	WRONG_PASSWORD_SECOND = 'Verification Code is invalid',
	WRONG_USERNAME_PASSWORD = 'Identifier or password is wrong',
	USER_NOT_FOUND = 'User not found',
	WRONG_PASSWORD_LOGIN = 'Invalid password',
	TOO_MANY_REQUESTS = 'Too many requests',
}

enum AuthorizeErrorMessage {
	PERMISSION_DENIED = 'Permission denied',
	MISSING_TOKEN = 'Missing token in header',
}

export { SignInErrorMessage, AuthorizeErrorMessage }
