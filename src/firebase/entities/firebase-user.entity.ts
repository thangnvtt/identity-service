import { User } from 'firebase/auth'

interface FirebaseMetaData {
	createdAt?: string
	lastSignedInAt?: string
	lastSignInTime?: string
	creationTime?: string
}

interface FirebaseProviderData {
	email?: string
	providerId?: string
	uid?: string
}

export enum FirebaseUserProvider {
	PASSWORD = 'password',
	GOOGLE = 'google.com',
}
export class FirebaseUserEntity {
	uid?: string

	email?: string

	emailVerified?: boolean

	phoneNumber?: string

	password?: string

	displayName?: string

	photoUrl?: string

	disabled?: boolean

	providerId?: string

	createdAt?: Date

	lastSignedInAt?: Date

	expiresIn?: number

	idToken?: string

	refreshToken?: string

	metadata?: FirebaseMetaData

	providerData?: FirebaseProviderData[]

	static fromFirebaseSDK(firebaseUser: User): FirebaseUserEntity {
		return {
			uid: firebaseUser.uid,
			email: firebaseUser.email,
			emailVerified: firebaseUser.emailVerified,
			phoneNumber: firebaseUser.phoneNumber,
			displayName: firebaseUser.displayName,
			photoUrl: firebaseUser.photoURL,
			providerId: firebaseUser.providerId,
			lastSignedInAt: new Date(firebaseUser.metadata.lastSignInTime),
			createdAt: new Date(firebaseUser.metadata.creationTime),
		}
	}
}
