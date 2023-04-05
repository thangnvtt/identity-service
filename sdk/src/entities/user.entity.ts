export enum UserStatus {
	ACTIVED = 'ACTIVED',
	INACTIVED = 'INACTIVED',
	BANNED = 'BANNED',
}

export enum UserState {
	INIT = 'INIT',
	CREATED = 'CREATED',
	UPDATED = 'UPDATED',
}

export enum UserProvider {
	PASSWORD = 'PASSWORD',
	WALLET = 'WALLET',
	GOOGLE = 'GOOGLE',
}

export class UserEntity {
	id?: string

	identifier?: string

	email?: string

	address?: string

	nickName?: string

	status?: UserStatus

	firstName?: string

	lastName?: string

	walletAddress?: string

	birthday?: number

	isAdmin?: boolean

	signedInAt?: number

	signedUpAt?: number

	avatar?: string

	state?: UserState

	defaultAddress?: string

	createdAt?: number

	updatedAt?: number

	isEnableTwoFactor?: boolean

	role?: string[]

	provider?: string

	linkEmailAt?: number
}
