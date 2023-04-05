import { Base } from '../common'

export interface UserIdentityAdminClientOptions {
	baseUrl: string
	tokenId?: string
}

export interface Responsive<T> {
	data: T
	meta: {
		page: number
		pageSize: number
		totalRecord: number
		totalPage: number
	}
}

export interface LoginResponse {
	data: {
		email: string
		localId: string
		idToken: string
		refreshToken: string
		expiresIn: string
	}
	meta: object
}

export class UserIdentityAdminClient extends Base {
	constructor(options?: UserIdentityAdminClientOptions) {
		super(options)
	}

	/**
	 * Login with role admin
	 * @param email
	 * @param password
	 * @returns login response
	 */
	async login(email: string, password: string): Promise<LoginResponse> {
		const response = await this.api.post('/admin/auth/login', { identifier: email, password })
		return <LoginResponse>this.dataFormatter(response)
	}
}
