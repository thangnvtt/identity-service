export class LinkEmailDto {
	code: string
	email: string
	password: string

	constructor(code: string, email: string, password: string) {
		this.code = code
		this.email = email
		this.password = password
	}
}
