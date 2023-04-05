import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator'
import * as moment from 'moment'
import { UserEntity, UserRole, UserState, UserStatus } from '../entities'

const defaultAvatar = process.env.DEFAULT_AVATAR
export class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	id: string

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	identifier: string

	@IsString()
	@IsOptional()
	@ApiProperty()
	email: string

	@IsString()
	@ApiProperty()
	firstName: string

	@IsString()
	@IsOptional()
	@ApiPropertyOptional({ default: '' })
	lastName: string

	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	nickName: string

	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	address: string

	@IsString()
	@IsOptional()
	walletAddress: string

	@IsUrl()
	@IsOptional()
	@ApiPropertyOptional()
	avatar: string

	@IsInt()
	@IsOptional()
	@ApiProperty()
	birthday?: number

	@IsOptional()
	@ApiPropertyOptional({
		default: UserStatus.ACTIVED,
	})
	status: UserStatus

	@IsOptional()
	state: string

	static fromGCPubsubEvent(messageData: any): UserEntity {
		const user: UserEntity = {
			id: messageData.id,
			email: messageData.email,
			avatar: messageData.photoUrl,
			firstName: undefined,
			lastName: undefined,
			nickName: undefined,
			walletAddress: undefined,
			status: UserStatus.ACTIVED,
			state: messageData.state,
			identifier: messageData.email || messageData.id,
			address: undefined,
			birthday: undefined,
			isAdmin: false,
			signedInAt: messageData.signedInAt || moment().unix(),
			signedUpAt: messageData.signedUpAt || moment().unix(),
			verifiedAt: undefined,
			createdAt: undefined,
			updatedAt: undefined,
			isEnableTwoFactor: undefined,
			role: [UserRole.USER],
			twoFactorAuthenticationSecret: undefined,
			provider: messageData.provider,
		}

		user.avatar = defaultAvatar
		user.nickName = Math.random().toString(36).substring(2, 10)
		return user
	}

	static toEntity(dto: CreateUserDto): UserEntity {
		return {
			id: dto.id,
			identifier: dto.id,
			email: dto.email,
			address: undefined,
			nickName: dto.nickName,
			status: dto.status,
			firstName: dto.firstName,
			lastName: dto.lastName,
			walletAddress: dto.walletAddress,
			birthday: dto.birthday,
			isAdmin: false,
			signedInAt: 0,
			signedUpAt: 0,
			avatar: dto.avatar,
			state: UserState.INIT,
			verifiedAt: 0,
			createdAt: Date.now(),
			updatedAt: 0,
			isEnableTwoFactor: false,
			twoFactorAuthenticationSecret: null,
			role: [UserRole.USER],
		}
	}

	static toPrisma(createDto: CreateUserDto): UserCreateInput {
		const { id, email, firstName, lastName, nickName, walletAddress, avatar, birthday, status, state, identifier, address } = createDto
		return {
			identifier,
			id,
			email,
			first_name: firstName,
			last_name: lastName,
			nick_name: nickName,
			wallet_address: walletAddress,
			avatar,
			birthday,
			state,
			status,
			address,
		}
	}
}

interface UserCreateInput {
	id: string
	identifier: string
	email?: string | null
	first_name: string
	last_name?: string
	nick_name?: string | null
	wallet_address?: string | null
	avatar?: string | null
	birthday?: number | null
	is_admin?: boolean
	status?: UserStatus
	two_factor_authentication_secret?: string | null
	is_enable_two_factor?: boolean
	signed_in_at?: number | null
	signed_up_at?: number | null
	state: string
	address: string
}
