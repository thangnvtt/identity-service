export class GetTokenTwoFactorDto {
	tfaCode: string

	constructor(tfaCode: string) {
		this.tfaCode = tfaCode
	}
}
