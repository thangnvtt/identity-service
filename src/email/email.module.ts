import { Module } from '@nestjs/common'
import { EmailService } from './email.service'
import { EmailController } from './email.controller'
import { EMAIL_SERVICE } from './interfaces/email.service.interface'

@Module({
	providers: [
		{
			provide: EMAIL_SERVICE,
			useClass: EmailService,
		},
	],
	controllers: [EmailController],
})
export class EmailModule {}
