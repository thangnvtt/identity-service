import { BadRequestException, CACHE_MANAGER, Controller, Inject, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { FileInterceptor } from '@nestjs/platform-express'
import { AvatarFileMimeType, AvatarFileSizeValidationPipe } from './pipe/avatar.pipe'
import { UploadResponse, UploadsService } from './uploads.service'
import { ConfigService } from '@nestjs/config'
import { UploadErrorMessage } from './constants'

@Controller('uploads')
export class UploadsController {
	private readonly redisKeyNumberFile: string
	private readonly maxNumberUploadFile: number
	private readonly timeToLive: number
	constructor(
		private readonly uploadsService: UploadsService,
		private readonly configService: ConfigService,
		@Inject(CACHE_MANAGER) private readonly cacheService: Cache,
	) {
		this.redisKeyNumberFile = this.configService.get('REDIS_KEY_NUMBER_FILE')
		this.maxNumberUploadFile = this.configService.get('MAX_NUMBER_UPLOADED_FILE')
		this.timeToLive = 86400000
	}
	@Post()
	@UseInterceptors(FileInterceptor('file'))
	async upload(@UploadedFile(new AvatarFileMimeType(), new AvatarFileSizeValidationPipe()) file: Express.Multer.File): Promise<UploadResponse> {
		const numUploadedFile = await this.cacheService.get(this.redisKeyNumberFile)
		const quantityOfUploadedFile = numUploadedFile ? Number(numUploadedFile) : 0
		if (quantityOfUploadedFile == this.maxNumberUploadFile) {
			throw new BadRequestException(UploadErrorMessage.MAX_FILE_UPLOADED)
		}

		const linkUrl = await this.uploadsService.upload(file)
		if (linkUrl) await this.cacheService.set(this.redisKeyNumberFile, quantityOfUploadedFile + 1, { ttl: this.timeToLive })

		return linkUrl
	}
}
