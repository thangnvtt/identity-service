import { SignWalletResponsive } from './responses.interface'

export interface IWalletProviderService {
	createFirebaseUser(address: string): Promise<number>

	signWallet(address: string, signature: string): Promise<SignWalletResponsive>
}

export const WALLET_PROVIDER_SERVICE = 'WALLET_PROVIDER_SERVICE'
