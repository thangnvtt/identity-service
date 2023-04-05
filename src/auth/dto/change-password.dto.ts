import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class ChangePasswordDto {
	@IsString()
	@IsNotEmpty()
	currentPassword: string

	@IsString()
	@IsNotEmpty()
	newPassword: string

	@IsString()
	@IsOptional()
	twoFactorCode: string
}
