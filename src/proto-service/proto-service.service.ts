import { Injectable } from '@nestjs/common'
import { AuthUserEntity } from 'src/auth/entities/user.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { IProtoService } from './interfaces/proto-service.interface'
import { MainEvent, MainEventType, MetaWalletEvent, UserIdentityUserEvent } from './proto-event/main'

@Injectable()
export class ProtoServiceService implements IProtoService {
	unMarshalledMetaWalletEvent(metaWalletEvent: Buffer) {
		const { object: wallet }: any = MainEvent.decode(metaWalletEvent)
		return MetaWalletEvent.decode(wallet)
	}

	unMarshalledMainEvent(mainEvent: Buffer): any {
		return MainEvent.decode(mainEvent)
	}

	unMarshalledUserEvent(userEvent: Buffer): any {
		const { object: user }: any = MainEvent.decode(userEvent)
		return UserIdentityUserEvent.decode(user)
	}

	async generateMainEvent(object: any, objectId: any, objectState: any, eventType: string, headers: any = {}): Promise<any> {
		const mainMessage = MainEvent.create({
			eventType: eventType,
			object: object,
			objectState: objectState,
			objectId: objectId,
			headers: headers,
		})
		return MainEvent.encode(mainMessage).finish()
	}

	async generateUserEvent(user: AuthUserEntity | UserEntity): Promise<any> {
		const userEvent = UserIdentityUserEvent.create({
			id: user.id,
			email: user.email,
			nickName: user.nickName,
			address: user.address,
			status: user.status,
			firstName: user.firstName,
			lastName: user.lastName,
			walletAddress: user.walletAddress,
			birthday: user.birthday,
			isAdmin: user.isAdmin,
			signedInAt: user.signedInAt,
			signedUpAt: user.signedUpAt,
			state: user.state,
			provider: user.provider,
		})

		const userMarshal = await UserIdentityUserEvent.encode(userEvent).finish()
		const mainMessage = MainEvent.create({
			eventType: MainEventType.IDENTITY_USER,
			object: userMarshal,
			objectState: user.state,
			objectId: user.id,
			headers: undefined,
		})
		return MainEvent.encode(mainMessage).finish()
	}
}
