import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { initializeApp } from 'firebase-admin/app'
import { Auth, DecodedIdToken, getAuth, UpdateRequest, UserRecord } from 'firebase-admin/auth'
import { IExchangeFirebaseTokenResponse, IFirebaseAdminService } from './interfaces/firebase-admin.interface'
import axios, { AxiosRequestConfig } from 'axios'
import { FirebaseUserEntity } from './entities'
@Injectable()
export class FirebaseAdminService implements IFirebaseAdminService {
	private readonly logger = new Logger(FirebaseAdminService.name)
	private auth: Auth
	private exchangeIdTokenUrl: string
	constructor(private readonly configService: ConfigService) {
		const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID')
		const serviceAccountId = this.configService.get<string>('TARGET_SERVICE_ACCOUNT')
		this.exchangeIdTokenUrl = this.configService.get<string>('EXCHANGE_ID_TOKEN_URL')

		const app = initializeApp({ projectId, serviceAccountId })
		this.auth = getAuth(app)
	}

	verifyIdToken(idToken: string, checkRevoked?: boolean): Promise<DecodedIdToken> {
		return this.auth.verifyIdToken(idToken, checkRevoked)
	}

	updateUser(uid: string, body: UpdateRequest): Promise<UserRecord> {
		return this.auth.updateUser(uid, body)
	}

	setCustomUserClaims(uid: string, customUserClaims: object): Promise<void> {
		return this.auth.setCustomUserClaims(uid, customUserClaims)
	}

	async exists(uid: string): Promise<UserRecord> {
		const user = await this.getUserByUid(uid).catch(() => {
			return undefined
		})
		if (!user) return undefined
		return user
	}

	async createCustomToken(uid: any): Promise<string> {
		return this.auth.createCustomToken(uid)
	}

	async getUserByUid(uid: string): Promise<UserRecord> {
		return this.auth.getUser(uid)
	}

	async createUser(user: FirebaseUserEntity): Promise<UserRecord> {
		return this.auth.createUser(user)
	}

	async getUserByEmail(email: string): Promise<UserRecord> {
		return this.auth.getUserByEmail(email)
	}

	async exchangeCustomTokenToIdToken(customToken: string): Promise<IExchangeFirebaseTokenResponse> {
		const options: AxiosRequestConfig = {
			url: this.exchangeIdTokenUrl,
			method: 'POST',
			data: { token: customToken, returnSecureToken: true },
		}
		const { data } = await axios.request(options)
		return data
	}
}
