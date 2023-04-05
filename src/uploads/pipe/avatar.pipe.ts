import { PipeTransform, Injectable } from '@nestjs/common'
import * as mime from 'mime-types'
import { BadRequestException } from '@nestjs/common/exceptions'
import { UploadErrorMessage } from '../constants'

@Injectable()
export class AvatarFileSizeValidationPipe implements PipeTransform {
	private maxSizeFileAvatar: number

	constructor() {
		this.maxSizeFileAvatar = Number(process.env.MAX_SIZE_FILE_AVT)
	}

	transform(value: any) {
		if (value.size > this.maxSizeFileAvatar) throw new BadRequestException(UploadErrorMessage.LIMIT_SIZE_FILE)
		return value
	}
}

@Injectable()
export class AvatarFileMimeType implements PipeTransform {
	transform(value: any) {
		const imageType = ['image/jpeg', 'image/gif', 'image/avif', 'image/apng', 'image/png', 'image/svg+xml', 'image/webp']
		if (!imageType.includes(mime.lookup(value.originalname))) throw new BadRequestException(UploadErrorMessage.FILE_TYPE)
		return value
	}
}
