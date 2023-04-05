import { Inject, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import { ProviderId } from 'firebase/auth'
import { AuthorizeErrorMessage, SignInErrorMessage } from 'src/firebase/constants'
import { FIREBASE_ADMIN_SERVICE, FIREBASE_CLIENT_SERVICE, IFirebaseAdminService, IFirebaseClientService } from 'src/firebase/interfaces'

@Injectable()
export class VerifiedUser implements NestMiddleware {
	constructor(@Inject(FIREBASE_ADMIN_SERVICE) private readonly firebaseAdminService: IFirebaseAdminService) {}
	async use(request: any, res: any, next: (error?: any) => void) {
		const headersAuth = request.headers.authorization
		const token = headersAuth && headersAuth.split(' ')[0] === 'Bearer' ? headersAuth.split(' ')[1] : undefined
		if (token) {
			try {
				const decode = await this.firebaseAdminService.verifyIdToken(token)
				request.user = decode
				request.user.id = decode.uid
				request.providerId = decode.firebase.sign_in_provider
			} catch (err) {
				throw new UnauthorizedException()
			}
		}
		next()
	}
}

@Injectable()
export class CheckPasswordEmail implements NestMiddleware {
	constructor(@Inject(FIREBASE_CLIENT_SERVICE) private readonly firebaseClientService: IFirebaseClientService) {}

	async use(request: any, res: any, next: (error?: any) => void) {
		if (request?.providerId !== ProviderId.PASSWORD) return next()

		const email: string = request.user.email
		const { password } = request.body
		if (!password || password.length === 0) throw new UnauthorizedException(SignInErrorMessage.MISSING_PASSWORD_LOGIN)
		try {
			const resSignIn = await this.firebaseClientService.signInWithEmailAndPassword(email, password)
			if (resSignIn) return next()
		} catch (err) {
			if (err.message === SignInErrorMessage.WRONG_USERNAME_PASSWORD) {
				throw new UnauthorizedException(SignInErrorMessage.WRONG_PASSWORD_LOGIN)
			}
			throw new UnauthorizedException(err.message)
		}
	}
}
