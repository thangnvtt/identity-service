// src/common/serializers/inbound-message-identity.deserializer.ts
import { ConsumerDeserializer, IncomingRequest } from '@nestjs/microservices'
import { Logger } from '@nestjs/common'
import { MainEvent, UserIdentityUserEvent } from './proto-event/main'

export class BaseEventDeserializer implements ConsumerDeserializer {
	public logger = new Logger('BaseEventDeserializer')

	getMainEvent(value: any): any {
		const event: any = MainEvent.decode(value)
		return event
	}

	deserialize(value: any, options?: Record<string, any>): IncomingRequest {
		return {
			pattern: undefined,
			data: value,
			id: '0',
		}
	}
}

export class IdentityUserUserEventDeserializer extends BaseEventDeserializer {
	logger = new Logger('BaseEventDeserializer')

	deserialize(value: any, options?: Record<string, any>): IncomingRequest {
		const mainEvent: any = this.getMainEvent(value)
		const userEvent = UserIdentityUserEvent.decode(mainEvent.object)
		return {
			pattern: mainEvent.eventType,
			data: userEvent.toJSON(),
			id: mainEvent.objectId,
		}
	}
}
