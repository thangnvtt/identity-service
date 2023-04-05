import { NestFactory } from '@nestjs/core'
import { randomUUID } from 'crypto'
import * as moment from 'moment'
import { AppModule } from '../app.module'
import { AuthService } from '../auth/auth.service'
import { AuthUserEntity } from '../auth/entities/user.entity'
import { AUTH_SERVICE } from '../auth/interfaces/auth.service.interface'

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule)
	const authService = await app.get<AuthService>(AUTH_SERVICE)

	const user: AuthUserEntity = {
		id: randomUUID(),
		email: 'titanadmin@coinhe.io',
		identifier: 'titanadmin@coinhe.io',
		password: 'TitanLab@123',
		createdAt: moment().unix(),
	}

	const userCreated = await authService.adminSignUp(user)
	console.log(userCreated)
	await app.close()
	process.exit(0)
}

bootstrap().catch(console.error)
