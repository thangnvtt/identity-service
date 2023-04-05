import { Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CloudPubSubService } from 'src/cloud-pub-sub/cloud-pub-sub.service'
import { CLOUD_PUB_SUB_SERVICE } from 'src/cloud-pub-sub/interfaces/cloud-pub-sub.interfaces'
import { PrismaService } from 'src/prisma/prisma.service'
import { PROTO_SERVICE } from 'src/proto-service/interfaces/proto-service.interface'
import { ProtoServiceService } from 'src/proto-service/proto-service.service'
import { USER_REPOSITORY } from 'src/users/interfaces/users.repositories.interface'
import { UserRepository } from 'src/users/repositories/users.repositories'
import { TWO_FACTOR_AUTH } from './interfaces/two-factor.service.interface'
import { TwoFactorAuthService } from './two-factor.service'

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true })],
	controllers: [],
	providers: [
		{
			provide: TWO_FACTOR_AUTH,
			useClass: TwoFactorAuthService,
		},
		{
			provide: USER_REPOSITORY,
			useClass: UserRepository,
		},
		{
			provide: CLOUD_PUB_SUB_SERVICE,
			useClass: CloudPubSubService,
		},
		{
			provide: PROTO_SERVICE,
			useClass: ProtoServiceService,
		},
		PrismaService,
	],
	exports: [
		{
			provide: TWO_FACTOR_AUTH,
			useClass: TwoFactorAuthService,
		},
	],
})
export class TwoFactorModule {}
