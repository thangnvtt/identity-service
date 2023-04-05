import { FirebaseUserEntity } from 'src/firebase/entities'
import { UserEntity, UserState, UserStatus } from 'src/users/entities'

export enum AuthUserStatus {
	ACTIVED = 'ACTIVED',
	INACTIVED = 'INACTIVED',
	BANNED = 'BANNED',
}

export enum AuthUserState {
	INIT = 'INIT',
	CREATED = 'CREATED',
	UPDATED = 'UPDATED',
}

export class AuthUserEntity {
	id: string

	identifier: string

	email: string

	nickName?: string

	address?: string

	status?: AuthUserStatus | UserStatus

	firstName?: string

	lastName?: string

	walletAddress?: string

	birthday?: number

	isAdmin?: boolean

	signedInAt?: number

	signedUpAt?: number

	avatar?: string

	state?: AuthUserState | UserState

	role?: string[]

	verifiedAt?: number

	createdAt?: number

	updatedAt?: number

	defaultAddress?: string

	isEnableTwoFactor?: boolean

	provider?: string

	password?: string

	twoFactorAuthenticationSecret?: string

	expiresIn?: number

	idToken?: string

	refreshToken?: string

	constructor(partial: Partial<AuthUserEntity>) {
		Object.assign(this, partial)
	}

	static toFirebaseUser(authUser: AuthUserEntity): FirebaseUserEntity {
		return {
			email: authUser.email,
			password: authUser.password,
		}
	}

	static fromFirebaseUser(user: FirebaseUserEntity): AuthUserEntity {
		return {
			id: user.uid,
			identifier: user.uid,
			email: user.email,
			password: user.password,
		}
	}

	static toUserEntity(authUser: AuthUserEntity): UserEntity {
		return {
			id: authUser.id,
			identifier: authUser.id,
			email: authUser.email,
			nickName: authUser.nickName,
			status: <UserStatus>authUser.status,
			firstName: authUser.firstName,
			lastName: authUser.lastName,
			walletAddress: authUser.walletAddress,
			birthday: Number(authUser.birthday),
			isAdmin: authUser.isAdmin,
			signedInAt: Number(authUser.signedInAt),
			signedUpAt: Number(authUser.signedUpAt),
			avatar: authUser.avatar,
			state: <UserState>authUser.state,
			address: authUser.address,
			verifiedAt: Number(authUser.verifiedAt),
			createdAt: Number(authUser.createdAt),
			updatedAt: Number(authUser.updatedAt),
			isEnableTwoFactor: authUser.isEnableTwoFactor,
			role: authUser.role,
			provider: authUser.provider,
			defaultAddress: authUser.defaultAddress,
			twoFactorAuthenticationSecret: authUser.twoFactorAuthenticationSecret,
		}
	}

	static fromUserEntity(user: UserEntity): AuthUserEntity {
		return {
			id: user.id,
			identifier: user.id,
			email: user.email,
			nickName: user.nickName,
			status: <UserStatus>user.status,
			firstName: user.firstName,
			lastName: user.lastName,
			walletAddress: user.walletAddress,
			birthday: Number(user.birthday),
			isAdmin: user.isAdmin,
			signedInAt: Number(user.signedInAt),
			signedUpAt: Number(user.signedUpAt),
			avatar: user.avatar,
			state: <UserState>user.state,
			address: user.address,
			verifiedAt: Number(user.verifiedAt),
			createdAt: Number(user.createdAt),
			updatedAt: Number(user.updatedAt),
			isEnableTwoFactor: user.isEnableTwoFactor,
			role: user.role,
			provider: user.provider,
			defaultAddress: user.defaultAddress,
		}
	}
}
