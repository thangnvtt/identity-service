enum UserErrorMessage {
	NOT_FOUND = 'User not found',
	EXISTED_EMAIL = 'This email is existed',
	EXISTED_WALLET = 'This address wallet is existed',
	EXISTED_ID = 'This id is existed',
}

enum AuthErrorMessage {
	UNAUTHORIZED = 'Signature verification failed',
}

export { UserErrorMessage, AuthErrorMessage }
