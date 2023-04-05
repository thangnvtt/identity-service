import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { AUTH_SERVICE } from './interfaces/auth.service.interface'
import { WalletProviderModule } from 'src/wallet-provider/wallet-provider.module'
import { FirebaseModule } from 'src/firebase/firebase.module'
import { CloudPubSubModule } from 'src/cloud-pub-sub/cloud-pub-sub.module'
import { ProtoServiceModule } from 'src/proto-service/proto-service.module'
import { AUTH_REPOSITORY } from './interfaces/auth.repository.interface'
import { AuthRepository } from './repositories/auth.repository'
import { UsersModule } from 'src/users/user.module'
import { PrismaService } from 'src/prisma/prisma.service'
import { AdminAuthController } from './auth-admin.controller'
import { TwoFactorModule } from 'src/two-factor/two-factor.module'
import { JSON_WEB_TOKEN_SERVICE } from './interfaces'
import { JsonWebTokenService } from './jwt.service'
import { JsonWebKeyController } from './jwks.controller'

@Module({
	imports: [WalletProviderModule, FirebaseModule, CloudPubSubModule, ProtoServiceModule, UsersModule, TwoFactorModule],
	providers: [
		{
			provide: AUTH_SERVICE,
			useClass: AuthService,
		},
		{
			provide: AUTH_REPOSITORY,
			useClass: AuthRepository,
		},
		{
			provide: JSON_WEB_TOKEN_SERVICE,
			useClass: JsonWebTokenService,
		},
		PrismaService,
	],
	controllers: [AuthController, AdminAuthController, JsonWebKeyController],
})
export class AuthModule {}
