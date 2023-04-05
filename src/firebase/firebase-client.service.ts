import { ConfigService } from '@nestjs/config'
import { FirebaseUserEntity } from './entities'
import { IFirebaseClientService, IFirebaseConfig } from './interfaces'
import { FirebaseApp, initializeApp } from 'firebase/app'
import { Auth, getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { FirebaseErrorMessages, SignInErrorMessage } from './constants'

@Injectable()
export class FireBaseClientService implements IFirebaseClientService {
	private app: FirebaseApp
	private auth: Auth

	constructor(private readonly configService: ConfigService) {
		const firebaseConfig: IFirebaseConfig = {
			apiKey: this.configService.get<string>('FIREBASE_API_KEY'),
			authDomain: this.configService.get<string>('FIREBASE_AUTH_DOMAIN'),
			projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
			storageBucket: this.configService.get<string>('FIREBASE_STORAGE_BUCKET'),
			messagingSenderId: this.configService.get<string>('FIREBASE_MESSAGING_SENDER_ID'),
			appId: this.configService.get<string>('FIREBASE_APP_ID'),
			measurementId: this.configService.get<string>('FIREBASE_MEASUREMENT_ID'),
		}

		this.app = initializeApp(firebaseConfig)
		this.auth = getAuth(this.app)
	}

	async signInWithEmailAndPassword(email: string, password: string): Promise<FirebaseUserEntity> {
		try {
			const user = await signInWithEmailAndPassword(this.auth, email, password)
			return FirebaseUserEntity.fromFirebaseSDK(user.user)
		} catch (err) {
			if (err.code === FirebaseErrorMessages.WRONG_PASSWORD) {
				throw new UnauthorizedException(SignInErrorMessage.WRONG_USERNAME_PASSWORD)
			}
			if (err.code === FirebaseErrorMessages.USER_NOT_FOUND) {
				throw new NotFoundException(SignInErrorMessage.USER_NOT_FOUND)
			}

			if (err.code === FirebaseErrorMessages.TOO_MANY_REQUESTS) {
				throw new NotFoundException(SignInErrorMessage.USER_NOT_FOUND)
			}

			throw err
		}
	}
}
