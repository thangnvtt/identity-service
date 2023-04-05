import { Controller, Inject, Logger } from '@nestjs/common'
import { EmailService } from './email.service'
import { EMAIL_SERVICE } from './interfaces/email.service.interface'
import { OnEvent } from '@nestjs/event-emitter'
import { ConfirmUserEvent, ConfirmUserEventName, ResetPasswordEvent, ResetPasswordEventName } from 'src/auth/entities'
import { ConfigService } from '@nestjs/config'

@Controller('email')
export class EmailController {
	private resetUrl: string
	private logger = new Logger(EmailController.name)

	constructor(
		@Inject(EMAIL_SERVICE)
		private readonly emailService: EmailService,
		private readonly configService: ConfigService,
	) {
		this.resetUrl = this.configService.get<string>('RESET_PASSWORD_URL')
	}

	@OnEvent(ResetPasswordEventName)
	async handleResetPasswordEvent(payload: ResetPasswordEvent) {
		const link = `${this.resetUrl}?code=${payload.token}`
		try {
			await this.emailService.resetPassword(payload.email, link, payload.nickName)
			this.logger.log(`Reset password email sent to ${payload.email}`)
		} catch (error) {
			this.logger.error(error)
		}
	}

	@OnEvent(ConfirmUserEventName)
	async handleConfirmUserEvent(payload: ConfirmUserEvent) {
		try {
			await this.emailService.verificationEmail(payload.nickName, payload.email, payload.code)
			this.logger.log(`Verification code is sent with confirm email for email: ${payload.email}`)
		} catch (error) {
			this.logger.error(error)
		}
	}
}
