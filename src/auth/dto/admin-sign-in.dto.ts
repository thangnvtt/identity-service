import { IsNotEmpty, IsString } from 'class-validator'

export class AdminSignInDto {
	@IsString()
	@IsNotEmpty()
	identifier: string

	@IsString()
	@IsNotEmpty()
	password: string
}
