import { Module } from '@nestjs/common'
import { FirebaseAdminService } from './firebase-admin.service'
import { FireBaseClientService } from './firebase-client.service'
import { FIREBASE_CLIENT_SERVICE } from './interfaces'
import { FIREBASE_ADMIN_SERVICE } from './interfaces/firebase-admin.interface'

@Module({
	providers: [
		{
			provide: FIREBASE_ADMIN_SERVICE,
			useClass: FirebaseAdminService,
		},
		{
			provide: FIREBASE_CLIENT_SERVICE,
			useClass: FireBaseClientService,
		},
	],
	exports: [
		{
			provide: FIREBASE_ADMIN_SERVICE,
			useClass: FirebaseAdminService,
		},
		{
			provide: FIREBASE_CLIENT_SERVICE,
			useClass: FireBaseClientService,
		},
	],
})
export class FirebaseModule {}
