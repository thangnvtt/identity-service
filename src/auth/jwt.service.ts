import { IJsonWebTokenService, JwtKey } from './interfaces'
import * as Jose from 'node-jose'
import * as jwktopem from 'jwk-to-pem'
import * as JWT from 'jsonwebtoken'
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { OnModuleInit } from '@nestjs/common'

export class JsonWebTokenService implements IJsonWebTokenService, OnModuleInit {
	private folderKey: string

	private pathKey: string

	constructor(folderKey: string) {
		folderKey = '.jwt'
		if (folderKey) this.folderKey = folderKey
		this.pathKey = `${this.folderKey}/jwks.json`
	}

	onModuleInit() {
		const isExists = existsSync(this.pathKey)
		if (!isExists) this.generateKey()
	}

	async decode(token: string): Promise<any> {
		const key = await this.getKey()
		const [firstKey] = key.keys
		const publicKey = jwktopem(firstKey)

		try {
			const decoded = JWT.verify(token, publicKey)
			return decoded
		} catch (err) {
			throw err
		}
	}

	async sign(payload: object): Promise<string> {
		const keyFile = readFileSync(this.pathKey)
		const keyStore = await Jose.JWK.asKeyStore(keyFile.toString())
		const [key] = keyStore.all({ use: 'sig' })
		const opt = { compact: true, jwk: key, fields: { typ: 'jwt' } }

		const token = await Jose.JWS.createSign(opt, key)
			.update(Buffer.from(JSON.stringify(payload)))
			.final()
		return token.toString()
	}

	async getKey(): Promise<JwtKey> {
		const keyFile = readFileSync(this.pathKey)
		const keyStore = await Jose.JWK.asKeyStore(keyFile.toString())
		return keyStore.toJSON() as JwtKey
	}

	async generateKey(): Promise<void> {
		const keyStore = Jose.JWK.createKeyStore()
		await keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' })
		const isExists = existsSync(this.folderKey)
		if (!isExists) mkdirSync(this.folderKey)
		return writeFileSync(this.pathKey, JSON.stringify(keyStore.toJSON(true), null, '  '))
	}
}
