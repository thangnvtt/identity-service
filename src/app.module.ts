import { CacheModule, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import * as redisStore from 'cache-manager-redis-store'
import { ConfigModule } from '@nestjs/config'
import { LoggerService } from './logger/logger.service'
import { LoggerModule } from './logger/logger.module'
import { CloudPubSubModule } from './cloud-pub-sub/cloud-pub-sub.module'
import { ProtoServiceService } from './proto-service/proto-service.service'
import { ProtoServiceModule } from './proto-service/proto-service.module'
import { CheckPasswordEmail, VerifiedUser } from './middleware/verifyUser.middleware'
import { UsersModule } from './users/user.module'
import { UserService } from './users/user.service'
import { UserRepository } from './users/repositories/users.repositories'
import { USER_SERVICES } from './users/interfaces/user.service.interface'
import { USER_REPOSITORY } from './users/interfaces/users.repositories.interface'
import { UtilsService } from './utils/utils.service'
import { UploadsModule } from './uploads/uploads.module'
import { PrismaService } from './prisma/prisma.service'
import { FIREBASE_CLIENT_SERVICE } from './firebase/interfaces'
import { FireBaseClientService } from './firebase/firebase-client.service'
import { TwoFactorModule } from './two-factor/two-factor.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { EmailModule } from './email/email.module'
import { FirebaseModule } from './firebase/firebase.module'
@Module({
	imports: [
		EventEmitterModule.forRoot(),
		ConfigModule.forRoot({ isGlobal: true }),
		CacheModule.register({
			isGlobal: true,
			store: redisStore,
			url: process.env.REDIS_URL,
			ttl: Number(process.env.REDIS_COMMON_TTL),
		}),
		AuthModule,
		LoggerModule,
		CloudPubSubModule,
		ProtoServiceModule,
		UsersModule,
		UploadsModule,
		TwoFactorModule,
		EmailModule,
		FirebaseModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		LoggerService,
		ProtoServiceService,
		{
			provide: USER_SERVICES,
			useClass: UserService,
		},
		{
			provide: USER_REPOSITORY,
			useClass: UserRepository,
		},
		{
			provide: FIREBASE_CLIENT_SERVICE,
			useClass: FireBaseClientService,
		},
		PrismaService,
		UtilsService,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(VerifiedUser)
			.exclude({ path: 'auth/verify-token', method: RequestMethod.GET })
			.forRoutes({ path: '*', method: RequestMethod.ALL })
		consumer.apply(CheckPasswordEmail).forRoutes({
			path: 'auth/2fa/turn-*',
			method: RequestMethod.PUT,
		})
	}
}
