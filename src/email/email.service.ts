import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { IEmailService, MuilBody } from './interfaces'

const RESET_PASSWORD_SUBJECT = '[Forgot password] Set-up your password'
const VERIFICATION_SUBJECT = '[Email Confirmation] Welcome to Bybet'
@Injectable()
export class EmailService implements IEmailService {
	private api: AxiosInstance

	private emailSentNoReply: string

	private muilBaseUrl: string

	private muilApiKey: string

	private muilBranch: string

	private resetPasswordTemplateId: string

	private emailSupport: string

	private emailVerificationTemplateId: string
	constructor(private readonly configService: ConfigService) {
		this.emailSentNoReply = this.configService.get<string>('EMAIL_SENT_NO_REPLY')
		this.muilBaseUrl = this.configService.get<string>('MUIL_BASE_URL')
		this.muilApiKey = this.configService.get<string>('MUIL_API_KEY')
		this.muilBranch = this.configService.get<string>('MUIL_BRANCH')
		this.resetPasswordTemplateId = this.configService.get<string>('RESET_PASSWORD_TEMPLATE_ID')
		this.emailVerificationTemplateId = this.configService.get<string>('VERIFICATION_TEMPLATE_ID')
		this.emailSupport = this.configService.get<string>('EMAIL_SUPPORT_SYSTEM')
		this.api = this.initMuilApi(this.muilBaseUrl, this.emailSentNoReply)
	}

	private initMuilApi(baseUrl: string, baseFrom: string): AxiosInstance {
		const api = axios.create({ baseURL: baseUrl })
		const requestInterceptor = (config: AxiosRequestConfig) => {
			const newConfig = config

			if (!config.data) return config
			if (!config.data.from) {
				newConfig.data.from = baseFrom
			}

			newConfig.headers['x-api-key'] = this.muilApiKey
			return newConfig
		}
		api.interceptors.request.use(requestInterceptor)
		return api
	}

	private buildEndpointUrl(templateId: string): string {
		return `/${this.muilBranch}/${templateId}/email`
	}

	async resetPassword(email: string, link: string, nickName: string): Promise<void> {
		if (!email || !link) return
		const body: MuilBody = {
			subject: RESET_PASSWORD_SUBJECT,
			to: email,
			props: {
				nickName,
				resetPasswordLink: link,
			},
		}
		const endpoint = this.buildEndpointUrl(this.resetPasswordTemplateId)
		return this.api.post(endpoint, body)
	}

	async verificationEmail(nickName: string, email: string, code: string): Promise<void> {
		if (!email) return
		const body: MuilBody = {
			subject: VERIFICATION_SUBJECT,
			to: email,
			props: {
				nickName,
				code,
				emailSupport: this.emailSupport,
			},
		}
		const endpoint = this.buildEndpointUrl(this.emailVerificationTemplateId)
		return this.api.post(endpoint, body)
	}
}
