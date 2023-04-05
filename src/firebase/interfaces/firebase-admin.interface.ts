import { DecodedIdToken, UpdateRequest, UserRecord } from 'firebase-admin/auth'
import { FirebaseUserEntity } from '../entities'

export interface IExchangeFirebaseTokenResponse {
	kind: string
	idToken: string
	refreshToken: string
	expiresIn: string
	isNewUser: boolean
}

export interface IFirebaseAdminService {
	getUserByUid(uid: string): Promise<UserRecord>

	createUser(user: FirebaseUserEntity): Promise<UserRecord>

	getUserByEmail(email: string): Promise<UserRecord>

	createCustomToken(uid: string): Promise<string>

	exists(uid: string): Promise<UserRecord>

	exchangeCustomTokenToIdToken(customToken: string): Promise<IExchangeFirebaseTokenResponse>

	setCustomUserClaims(uid: string, customUserClaims: object): Promise<void>

	updateUser(uid: string, body: UpdateRequest): Promise<UserRecord>

	verifyIdToken(idToken: string, checkRevoked?: boolean): Promise<DecodedIdToken>
}

export const FIREBASE_ADMIN_SERVICE = 'FIREBASE_ADMIN_SERVICE'
