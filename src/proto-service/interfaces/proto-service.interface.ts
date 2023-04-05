import { AuthUserEntity } from 'src/auth/entities/user.entity'
import { UserEntity } from 'src/users/entities/user.entity'

export interface IProtoService {
	generateMainEvent(object: any, objectId: any, objectState: any, eventType: string, headers: any): Promise<any>

	generateUserEvent(user: AuthUserEntity | UserEntity): Promise<any>

	unMarshalledMainEvent(mainEvent: Buffer): any

	unMarshalledUserEvent(userEvent: Buffer): any

	unMarshalledMetaWalletEvent(metaWalletEvent: Buffer): any
}

export const PROTO_SERVICE = 'PROTO SERVICE'
