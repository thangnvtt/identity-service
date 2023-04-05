import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import * as ethUtil from 'ethereumjs-util'

@Injectable()
export class UtilsService {
	constructor(private readonly configService: ConfigService) {}

	generateNonce(): number {
		return Math.floor(Math.random() * 1_000_000)
	}

	async getSecretAuthKey(key: string): Promise<string> {
		const res = await axios.get(this.configService.get('LINK_GET_JWT_TOKEN'), {
			headers: {
				'Cache-Control': 'max-age',
			},
		})
		const data = res.data
		const keys = Object.keys(data)
		const values = Object.values(data)
		return values[keys.indexOf(key)].toString()
	}
	getDateFromUnixTimestamp(timestamp: number): Date {
		return new Date(timestamp * 1000)
	}

	isWalletAddress(address: string): boolean {
		return ethUtil.isValidAddress(address)
	}
}
