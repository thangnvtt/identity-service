import { FirebaseUserEntity } from '../entities'

export interface IFirebaseConfig {
	apiKey: string
	authDomain: string
	projectId: string
	storageBucket: string
	messagingSenderId: string
	appId: string
	measurementId: string
}

export interface IFirebaseClientService {
	signInWithEmailAndPassword(email: string, password: string): Promise<FirebaseUserEntity>
}

export const FIREBASE_CLIENT_SERVICE = 'FIREBASE_CLIENT_SERVICE'
