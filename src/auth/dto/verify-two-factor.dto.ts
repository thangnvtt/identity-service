import { IsString } from 'class-validator'

export class VerifyTwoFactorDto {
	@IsString()
	twoFactorCode: string
}
