import { Module } from '@nestjs/common'
import { FirebaseModule } from 'src/firebase/firebase.module'
import { UtilsService } from 'src/utils/utils.service'
import { WALLET_PROVIDER_SERVICE } from './interfaces/wallet-provider.interface'
import { WalletProviderService } from './wallet-provider.service'

@Module({
	imports: [FirebaseModule],
	providers: [
		UtilsService,
		{
			provide: WALLET_PROVIDER_SERVICE,
			useClass: WalletProviderService,
		},
	],
	exports: [
		{
			provide: WALLET_PROVIDER_SERVICE,
			useClass: WalletProviderService,
		},
	],
})
export class WalletProviderModule {}
