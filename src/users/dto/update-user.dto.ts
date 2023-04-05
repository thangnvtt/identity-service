import { PartialType } from '@nestjs/mapped-types'
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator'
import { UserEntity, UserState, UserStatus } from '../entities'
import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@IsString()
	@IsOptional()
	firstName: string

	@IsString()
	@IsOptional()
	lastName: string

	@IsString()
	@IsOptional()
	nickName: string

	@IsString()
	@IsOptional()
	address: string

	@IsUrl()
	@IsOptional()
	avatar: string

	@IsNumber()
	@IsOptional()
	birthday: number

	@IsEnum(UserStatus)
	@IsOptional()
	status: UserStatus

	@IsOptional()
	@IsNumber()
	signedInAt: number

	@IsOptional()
	@IsBoolean()
	@IsOptional()
	twoFactorAuthenticationSecret: string

	@IsBoolean()
	@IsOptional()
	isEnableTwoFactor: boolean

	static toEntity(dto: UpdateUserDto): UserEntity {
		return {
			id: dto.id,
			identifier: undefined,
			email: dto.email,
			address: dto.address,
			nickName: dto.nickName,
			status: dto.status,
			firstName: dto.firstName,
			lastName: dto.lastName,
			walletAddress: undefined,
			birthday: dto.birthday,
			isAdmin: undefined,
			signedInAt: dto.signedInAt,
			signedUpAt: undefined,
			avatar: dto.avatar,
			state: UserState.UPDATED,
			verifiedAt: undefined,
			createdAt: undefined,
			updatedAt: Date.now(),
			isEnableTwoFactor: dto.isEnableTwoFactor,
			twoFactorAuthenticationSecret: dto.twoFactorAuthenticationSecret,
		}
	}
}
