import { NestFactory } from '@nestjs/core'
import { CloudPubSubModule } from 'src/cloud-pub-sub/cloud-pub-sub.module'
import { USER_IDENTITY_TOPIC } from 'src/cloud-pub-sub/constants'
import { CLOUD_PUB_SUB_SERVICE, ICloudPubSubService } from 'src/cloud-pub-sub/interfaces/cloud-pub-sub.interfaces'
import { FirebaseUserEntity } from 'src/firebase/entities'
import { IProtoService, PROTO_SERVICE } from 'src/proto-service/interfaces/proto-service.interface'
import { ProtoServiceModule } from 'src/proto-service/proto-service.module'
import { UserEntity, UserProvider, UserState } from 'src/users/entities'
import { IUserService, USER_SERVICES } from 'src/users/interfaces/user.service.interface'
import * as moment from 'moment'
import { UsersModule } from 'src/users/user.module'
import { PubsubMessage } from '@google-cloud/pubsub/build/src/publisher'
import { CommonState } from 'src/proto-service/proto-event/main'
import { FirebaseUserProvider } from 'src/firebase/entities/firebase-user.entity'

export const userCreateEvent = async (user: FirebaseUserEntity): Promise<void> => {
	let provider: string
	const protoApp = await NestFactory.create(ProtoServiceModule)
	const pubSubApp = await NestFactory.create(CloudPubSubModule)
	const protoService = <IProtoService>protoApp.get(PROTO_SERVICE)
	const cloudPubSubService = <ICloudPubSubService>pubSubApp.get(CLOUD_PUB_SUB_SERVICE)

	console.log(`userCreateEvent: ${JSON.stringify(user)}`)

	const providerFirebase = user.providerData && user.providerData.length ? user.providerData[0].providerId : ''
	if (providerFirebase === FirebaseUserProvider.GOOGLE) provider = UserProvider.GOOGLE
	if (providerFirebase === FirebaseUserProvider.PASSWORD) provider = UserProvider.PASSWORD

	const userEntity = new UserEntity({
		id: user.uid,
		email: user.email,
		avatar: user.photoUrl,
		state: UserState.INIT,
		signedInAt: moment(user.metadata.lastSignedInAt).unix(),
		provider: provider,
		signedUpAt: moment(user.metadata.createdAt).unix(),
	})
	const userEvent = await protoService.generateUserEvent(userEntity)
	await cloudPubSubService.publishProtoMessage(USER_IDENTITY_TOPIC, userEvent)
}

export const metaWalletEvent = async (walletEvent: PubsubMessage): Promise<void> => {
	const event = walletEvent.data ? Buffer.from(walletEvent.data as string, 'base64') : undefined
	const userApp = await NestFactory.createApplicationContext(UsersModule)
	const protoApp = await NestFactory.create(ProtoServiceModule)

	const userService = <IUserService>userApp.get(USER_SERVICES)
	const protoService = <IProtoService>protoApp.get(PROTO_SERVICE)

	const wallet = protoService.unMarshalledMetaWalletEvent(event)
	if (wallet.state !== CommonState.CREATED) return

	console.log(`meta wallet created : ${JSON.stringify(wallet)}`)

	await userService.update(wallet.userId, { defaultAddress: wallet.id })
}
