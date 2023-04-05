import { Module } from '@nestjs/common'
import { PROTO_SERVICE } from './interfaces/proto-service.interface'
import { ProtoServiceService } from './proto-service.service'

@Module({
	providers: [
		{
			provide: PROTO_SERVICE,
			useClass: ProtoServiceService,
		},
	],
	exports: [
		{
			provide: PROTO_SERVICE,
			useClass: ProtoServiceService,
		},
	],
})
export class ProtoServiceModule {}
