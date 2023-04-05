import { Bucket, Storage } from '@google-cloud/storage'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface UploadResponse {
	url: string
}

@Injectable()
export class UploadsService {
	private readonly bucket: Bucket
	private storageProjectId: string
	private bucketId: string
	constructor(private readonly configService: ConfigService) {
		this.storageProjectId = this.configService.get('STORAGE_PROJECT_ID')
		this.bucketId = this.configService.get('BUCKET_ID')
		this.bucket = new Storage({ projectId: this.storageProjectId }).bucket(this.bucketId)
	}

	async upload(inputFile): Promise<UploadResponse> {
		const filePath = inputFile.originalname
		const destination = `${Date.now()}_${filePath}`

		const file = this.bucket.file(destination)
		await file.save(inputFile.buffer, {
			contentType: inputFile.mimetype,
		})

		return { url: file.publicUrl() }
	}
}
