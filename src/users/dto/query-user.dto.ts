import { Prisma, UserStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { decamelize } from 'humps'
export class UserQueryDto {
	@IsString()
	@IsOptional()
	id?: string

	@IsString()
	@IsOptional()
	ids?: string

	@IsString()
	@IsOptional()
	walletAddress?: string

	@IsEmail()
	@IsOptional()
	email?: string

	@IsEnum(UserStatus)
	@IsOptional()
	status?: string

	@IsNumber()
	@Type(() => Number)
	@IsOptional()
	signedInFrom?: number

	@IsNumber()
	@Type(() => Number)
	@IsOptional()
	signedInTo?: number

	@IsNumber()
	@Type(() => Number)
	@IsOptional()
	signedUpFrom?: number

	@IsNumber()
	@Type(() => Number)
	@IsOptional()
	signedUpTo?: number

	@IsString()
	@IsOptional()
	defaultAddress?: string

	@IsString()
	@IsOptional()
	identifiers?: string

	@IsOptional()
	orders?: string[] | string
}

export class WhereUser {
	orders: any = []
	query: any = {}
	whereId: any = {}
	whereIds: any = {}
	whereEmail: any = {}
	whereStatus: any = {}
	whereSignInFrom: any = {}
	whereSignInTo: any = {}
	whereSignUpFrom: any = {}
	whereSignUpTo: any = {}
	whereAddress: any = {}
	whereDefaultAddress: any = {}
	whereIdentifiers: any = {}
	constructor(userQueryDto: UserQueryDto = {}) {
		const { id, ids, email, status, signedInFrom, signedInTo, signedUpFrom, signedUpTo, walletAddress, defaultAddress, identifiers, orders } =
			userQueryDto

		if (id)
			this.whereId = Prisma.validator<Prisma.UserWhereInput>()({
				id,
			})

		if (ids) {
			// id = asdf, 1,asdf
			const newIds = ids.split(',')
			this.whereIds = Prisma.validator<Prisma.UserWhereInput>()({
				id: {
					in: newIds,
				},
			})
		}

		if (walletAddress) {
			const newWalletAddress = walletAddress.indexOf(',') ? walletAddress.split(',').map((el) => el.trim()) : walletAddress
			this.whereAddress = Prisma.validator<Prisma.UserWhereInput>()({
				wallet_address: {
					in: newWalletAddress,
				},
			})
		}

		if (email)
			this.whereEmail = Prisma.validator<Prisma.UserWhereInput>()({
				email: {
					contains: email,
				},
			})

		if (status && (status == UserStatus.ACTIVED || status == UserStatus.INACTIVED || status == UserStatus.BANNED)) {
			this.whereStatus = Prisma.validator<Prisma.UserWhereInput>()({
				status,
			})
		}

		if (signedInFrom) {
			this.whereSignInFrom = Prisma.validator<Prisma.UserWhereInput>()({
				signed_in_at: {
					gte: signedInFrom,
				},
			})
		}

		if (signedInTo) {
			this.whereSignInTo = Prisma.validator<Prisma.UserWhereInput>()({
				signed_in_at: {
					lte: signedInTo,
				},
			})
		}

		if (signedUpFrom) {
			this.whereSignUpFrom = Prisma.validator<Prisma.UserWhereInput>()({
				signed_up_at: {
					gte: signedUpFrom,
				},
			})
		}

		if (signedUpTo) {
			this.whereSignUpTo = Prisma.validator<Prisma.UserWhereInput>()({
				signed_up_at: {
					lte: signedUpTo,
				},
			})
		}

		if (defaultAddress) {
			const defaultAddressList = defaultAddress.indexOf(',') ? defaultAddress.split(',').map((el) => el.trim()) : defaultAddress
			this.whereDefaultAddress = Prisma.validator<Prisma.UserWhereInput>()({
				default_address: {
					in: defaultAddressList,
				},
			})
		}

		if (identifiers) {
			const identifierList = identifiers.indexOf(',') ? identifiers.split(',').map((el) => el.trim()) : identifiers
			this.whereIdentifiers = Prisma.validator<Prisma.UserWhereInput>()({
				identifier: {
					in: identifierList,
				},
			})
		}
		this.query = Prisma.validator<Prisma.UserWhereInput>()({
			AND: [
				this.whereId,
				this.whereIds,
				this.whereEmail,
				this.whereSignInFrom,
				this.whereSignInTo,
				this.whereSignUpFrom,
				this.whereSignUpTo,
				this.whereStatus,
				this.whereAddress,
				this.whereDefaultAddress,
				this.whereIdentifiers,
			],
		})

		if (orders) {
			if (typeof orders === 'string') {
				const [key, value] = orders.split(' ')
				this.orders.push = { [decamelize(key)]: value }
			}

			if (Array.isArray(orders)) {
				orders.forEach((order) => {
					const [key, value] = order.split(' ')
					this.orders.push({ [decamelize(key)]: value })
				})
			}
		}
	}
}
