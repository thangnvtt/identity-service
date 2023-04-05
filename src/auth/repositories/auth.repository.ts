import { Inject, UnauthorizedException } from '@nestjs/common'
import { USER_IDENTITY_TOPIC } from 'src/cloud-pub-sub/constants'
import { CLOUD_PUB_SUB_SERVICE, ICloudPubSubService } from 'src/cloud-pub-sub/interfaces/cloud-pub-sub.interfaces'
import { FIREBASE_ADMIN_SERVICE, FIREBASE_CLIENT_SERVICE, IFirebaseAdminService, IFirebaseClientService } from 'src/firebase/interfaces'
import { IProtoService, PROTO_SERVICE } from 'src/proto-service/interfaces/proto-service.interface'
import { UserRole } from 'src/users/entities'
import { USER_SERVICES } from 'src/users/interfaces/user.service.interface'
import { UserService } from 'src/users/user.service'
import { AuthErrorMessage } from '../constants'
import { AuthUserEntity } from '../entities/user.entity'
import { IAuthRepository } from '../interfaces/auth.repository.interface'
export class AuthRepository implements IAuthRepository {
	constructor(
		@Inject(CLOUD_PUB_SUB_SERVICE)
		private readonly cloudPubSubService: ICloudPubSubService,

		@Inject(PROTO_SERVICE)
		private readonly protoService: IProtoService,

		@Inject(FIREBASE_ADMIN_SERVICE)
		private readonly firebaseAdminService: IFirebaseAdminService,

		@Inject(USER_SERVICES)
		private readonly userService: UserService,

		@Inject(FIREBASE_CLIENT_SERVICE)
		private readonly firebaseClientService: IFirebaseClientService,
	) {}

	async adminCreateUser(user: AuthUserEntity): Promise<AuthUserEntity> {
		const firebaseUser = AuthUserEntity.toFirebaseUser(user)
		const firebaseUserCreated = await this.firebaseAdminService.createUser(firebaseUser)
		const authUserEntity = AuthUserEntity.fromFirebaseUser(firebaseUserCreated)

		const userEntity = AuthUserEntity.toUserEntity(authUserEntity)
		userEntity.isAdmin = true
		userEntity.role = [UserRole.ADMIN]

		const userCreated = await this.userService.create(userEntity)
		return AuthUserEntity.fromUserEntity(userCreated)
	}

	async adminSignIn(identifier: string, password: string): Promise<AuthUserEntity> {
		const firebaseUser = await this.firebaseClientService.signInWithEmailAndPassword(identifier, password)
		const user = await this.userService.findById(firebaseUser.uid)

		if (!user.isAdmin) throw new UnauthorizedException(AuthErrorMessage.UNAUTHORIZED)
		const authUser = AuthUserEntity.fromUserEntity(user)

		await this.firebaseAdminService.setCustomUserClaims(firebaseUser.uid, { role: user.role, isAdmin: user.isAdmin })
		const tokenCustom = await this.firebaseAdminService.createCustomToken(firebaseUser.uid)
		const exchangeToken = await this.firebaseAdminService.exchangeCustomTokenToIdToken(tokenCustom)
		authUser.idToken = exchangeToken.idToken
		authUser.refreshToken = exchangeToken.refreshToken
		authUser.expiresIn = Number(exchangeToken.expiresIn)

		return authUser
	}

	async notify(user: AuthUserEntity): Promise<void> {
		const userEvent = await this.protoService.generateUserEvent(user)
		this.cloudPubSubService.publishProtoMessage(USER_IDENTITY_TOPIC, userEvent)
	}
}
