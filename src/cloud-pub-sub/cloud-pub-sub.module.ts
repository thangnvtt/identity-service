import { Module } from '@nestjs/common'
import { CloudPubSubService } from './cloud-pub-sub.service'
import { ConfigModule } from '@nestjs/config'
import { CLOUD_PUB_SUB_SERVICE } from './interfaces/cloud-pub-sub.interfaces'
@Module({
	imports: [ConfigModule],
	controllers: [],
	providers: [
		{
			provide: CLOUD_PUB_SUB_SERVICE,
			useClass: CloudPubSubService,
		},
	],
	exports: [
		{
			provide: CLOUD_PUB_SUB_SERVICE,
			useClass: CloudPubSubService,
		},
	],
})
export class CloudPubSubModule {}
