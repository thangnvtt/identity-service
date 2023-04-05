import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { FirebaseAdminService } from './firebase-admin.service'
import { FireBaseClientService } from './firebase-client.service'
import { FirebaseModule } from './firebase.module'
import { FIREBASE_ADMIN_SERVICE, FIREBASE_CLIENT_SERVICE } from './interfaces'
import { faker } from '@faker-js/faker'

describe('FirebaseClientService', () => {
	let firebaseClient: FireBaseClientService
	let firebaseAdmin: FirebaseAdminService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule.forRoot({ isGlobal: true }), FirebaseModule],
			providers: [
				{
					provide: FIREBASE_CLIENT_SERVICE,
					useClass: FireBaseClientService,
				},
			],
		}).compile()

		firebaseClient = module.get<FireBaseClientService>(FIREBASE_CLIENT_SERVICE)
		firebaseAdmin = module.get<FirebaseAdminService>(FIREBASE_ADMIN_SERVICE)
	})

	it('should be sign in with email and password', async () => {
		const email = faker.internet.email()
		const password = faker.internet.password()
		await firebaseAdmin.createUser({ email, password })
		const user = await firebaseClient.signInWithEmailAndPassword(email, password)
		expect(user.email).toEqual(email.toLowerCase())
	})
})
