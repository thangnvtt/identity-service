import { User } from '@prisma/client'

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

export enum UserRole {
	USER = 'USER',
	LEADER = 'LEADER',
	ADMIN = 'ADMIN',
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

	twoFactorAuthenticationSecret?: string

	state?: UserState

	verifiedAt?: number

	createdAt?: number

	updatedAt?: number

	isEnableTwoFactor?: boolean

	role?: string[]

	provider?: string

	defaultAddress?: string

	linkEmailAt?: number

	constructor(partial: Partial<UserEntity>) {
		Object.assign(this, partial)
	}

	static fromModel(prisma: User): UserEntity {
		return {
			id: prisma.id,
			identifier: prisma.identifier,
			email: prisma.email,
			nickName: prisma.nick_name,
			status: <UserStatus>prisma.status,
			firstName: prisma.first_name,
			lastName: prisma.last_name,
			walletAddress: prisma.wallet_address,
			birthday: Number(prisma.birthday),
			isAdmin: prisma.is_admin,
			signedInAt: Number(prisma.signed_in_at),
			signedUpAt: Number(prisma.signed_up_at),
			avatar: prisma.avatar,
			state: <UserState>prisma.state,
			address: prisma.address,
			twoFactorAuthenticationSecret: prisma.two_factor_authentication_secret,
			verifiedAt: Number(prisma.verified_at),
			createdAt: Number(prisma.created_at),
			updatedAt: Number(prisma.updated_at),
			isEnableTwoFactor: prisma.is_enable_two_factor,
			role: prisma.role,
			provider: prisma.provider,
			defaultAddress: prisma.default_address,
			linkEmailAt: Number(prisma.linked_email_at),
		}
	}

	static toModel(entity: UserEntity): User {
		const birthday = entity.birthday ? BigInt(entity.birthday) : undefined
		const signedInAt = entity.signedInAt ? BigInt(entity.signedInAt) : undefined
		const signedUpAt = entity.signedUpAt ? BigInt(entity.signedUpAt) : undefined
		const verifiedAt = entity.verifiedAt ? BigInt(entity.verifiedAt) : undefined
		const createdAt = entity.createdAt ? BigInt(entity.createdAt) : undefined
		const updatedAt = entity.updatedAt ? BigInt(entity.updatedAt) : undefined
		const linkEmailAt = entity.linkEmailAt ? BigInt(entity.linkEmailAt) : undefined

		return {
			id: entity.id,
			email: entity.email,
			nick_name: entity.nickName,
			status: entity.status,
			first_name: entity.firstName,
			last_name: entity.lastName,
			wallet_address: entity.walletAddress,
			birthday: birthday,
			is_admin: entity.isAdmin,
			signed_in_at: signedInAt,
			signed_up_at: signedUpAt,
			avatar: entity.avatar,
			state: entity.state,
			address: entity.address,
			identifier: entity.identifier,
			verified_at: verifiedAt,
			created_at: createdAt,
			updated_at: updatedAt,
			is_enable_two_factor: entity.isEnableTwoFactor,
			two_factor_authentication_secret: entity.twoFactorAuthenticationSecret,
			role: entity.role,
			provider: entity.provider,
			default_address: entity.defaultAddress,
			linked_email_at: linkEmailAt,
		}
	}
}

export interface StateUserEntity {
	isEnableTwoFactor: boolean
	email: string
	user_id: string
	email_verified: boolean
}
