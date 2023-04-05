import { CACHE_MANAGER, Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { IWalletProviderService } from './interfaces/wallet-provider.interface'
import { Cache } from 'cache-manager'
import { UtilsService } from 'src/utils/utils.service'
import { ConfigService } from '@nestjs/config'
import * as ethUtil from 'ethereumjs-util'
import * as sigUtil from 'eth-sig-util'
import { SignWalletResponsive } from './interfaces/responses.interface'
import { AuthErrorMessage, UserErrorMessage } from './constants'
import { FIREBASE_ADMIN_SERVICE, IFirebaseAdminService } from 'src/firebase/interfaces'

@Injectable()
export class WalletProviderService implements IWalletProviderService {
	private signTimeToLive: number
	private prefixLoginCode: string
	private readonly logger = new Logger(WalletProviderService.name)
	constructor(
		@Inject(CACHE_MANAGER) private cacheService: Cache,
		@Inject(FIREBASE_ADMIN_SERVICE)
		private readonly firebaseService: IFirebaseAdminService,
		private readonly utilsService: UtilsService,
		private readonly configService: ConfigService,
	) {
		this.signTimeToLive = this.configService.get<number>('REDIS_WALLET_SIGN_TTL')
		this.prefixLoginCode = this.configService.get<string>('PREFIX_WALLET_LOGIN_CODE')
	}

	async createFirebaseUser(address: string): Promise<number> {
		//With wallet sign up via wallet, uid is address
		const user = await this.firebaseService.exists(address)
		if (!user) {
			await this.firebaseService.createUser({ uid: address })
		}

		const nonce = this.generateNonce()
		await this.cacheService.set(address, nonce, { ttl: this.signTimeToLive })

		return nonce
	}

	async signWallet(publicAddress: string, signature: string): Promise<SignWalletResponsive> {
		const user = await this.firebaseService.exists(publicAddress)
		if (!user) throw new NotFoundException(UserErrorMessage.NOT_FOUND)

		const nonce = await this.cacheService.get(user.uid)
		const isValid = this.isSignatureValid(nonce, publicAddress, signature)
		if (!isValid) throw new UnauthorizedException(AuthErrorMessage.UNAUTHORIZED)

		const tokenCustom = await this.firebaseService.createCustomToken(user.uid)
		const exchangeToken = await this.firebaseService.exchangeCustomTokenToIdToken(tokenCustom)
		return {
			idToken: exchangeToken.idToken,
			localId: user.uid,
			refreshToken: exchangeToken.refreshToken,
			expiresIn: exchangeToken.expiresIn,
			isNewUser: exchangeToken.isNewUser,
			kind: exchangeToken.kind,
		}
	}

	private generateNonce(): number {
		return this.utilsService.generateNonce()
	}

	private isSignatureValid(nonce: number, publicAddress: string, signature: string): boolean {
		const msg = `${this.prefixLoginCode}${nonce}`
		// We now are in possession of msg, publicAddress and signature. We
		// will use a helper from eth-sig-util to extract the address from the signature
		const msgBufferHex = ethUtil.bufferToHex(Buffer.from(msg, 'utf8'))
		const address = sigUtil.recoverPersonalSignature({
			data: msgBufferHex,
			sig: signature,
		})

		return address.toLowerCase() === publicAddress.toLowerCase()
	}
}
