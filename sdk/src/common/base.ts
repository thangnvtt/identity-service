import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { camelizeKeys } from 'humps'
import { GetTokenTwoFactorDto, UpdateUser, UserQuery } from '../dto'
import { DecodedIdToken, ProviderId, UserEntity } from '../entities'
const DEFAULT_ORDER = ['createdAt desc']
export interface BaseClientOptions {
	baseUrl: string
	tokenId?: string
	refreshToken?: string
	firebaseApiKey?: string
	onTokenChange?: (tokenId: string, refreshToken: string) => void
}

export interface Responsive<T> {
	data: T
	meta: {
		page?: number
		pageSize?: number
		totalRecord?: number
		totalPage?: number
	}
}

export interface GetTokenTwoFactorResponse {
	data: {
		idToken: string
		expiresIn?: string
	}
	meta: object
}

const DEFAULT_BASE_URL = 'https://api-bybet.noownerapi.com/identity'
const GOOGLE_IDENTITY_BASE_URL = 'https://securetoken.googleapis.com/v1'
export class Base {
	protected api: AxiosInstance
	protected googleIdentityApi: AxiosInstance
	protected _tokenId?: string
	protected _refreshToken?: string
	protected firebaseApiKey?: string
	_onTokenChange?: (tokenId: string, refreshToken: string) => void

	constructor(options?: BaseClientOptions) {
		if (!options) {
			options = {
				baseUrl: DEFAULT_BASE_URL,
				tokenId: '',
			}
		}
		this._onTokenChange = options.onTokenChange
		this.api = axios.create({ baseURL: options.baseUrl })
		this.googleIdentityApi = axios.create({ baseURL: GOOGLE_IDENTITY_BASE_URL })
		this._tokenId = options.tokenId
		this._refreshToken = options.refreshToken
		this.firebaseApiKey = options.firebaseApiKey

		const responseInterceptor = async (response: AxiosResponse) => {
			if (response.data) {
				response.data = camelizeKeys(response.data)
			}
			if (response.status === 401) {
				await this.refreshToken()
			}
			return response.data
		}
		const requestInterceptor = (config: AxiosRequestConfig) => {
			const newConfig = config
			if (!config.params) config.params = {}
			if (!config.params.orders) config.params.orders = DEFAULT_ORDER

			if (config.params) {
				newConfig.params = camelizeKeys(config.params)
			}

			if (!newConfig.headers) {
				newConfig.headers = {}
			}

			if (this._tokenId !== '') newConfig.headers['Authorization'] = `Bearer ${this._tokenId}`

			if (config.data && newConfig.headers['Content-Type'] !== 'multipart/form-data') {
				newConfig.data = camelizeKeys(config.data)
			}

			return newConfig
		}

		this.api.interceptors.request.use(requestInterceptor)
		this.api.interceptors.response.use(responseInterceptor)
	}

	async refreshToken() {
		if (this._refreshToken) {
			const params = new URLSearchParams()
			params.append('grant_type', 'refresh_token')
			params.append('refresh_token', this._refreshToken)
			const response = await this.googleIdentityApi.post(`/token?key=${this.firebaseApiKey}`, params)
			const { idToken, refreshToken, expiresIn } = camelizeKeys(response.data)
			this.setTokenId(idToken)
			this.setRefreshToken(refreshToken)
			this.handleOnTokenChange(idToken, refreshToken)
		}
	}

	/**
	 * Get json web keys
	 */
	async getJsonWebKeys(): Promise<any> {
		return this.api.get('/jwks')
	}

	/**
	 * Get token two factor
	 */
	async getTokenTwoFactor(params: GetTokenTwoFactorDto): Promise<GetTokenTwoFactorResponse> {
		const twoFactorCode = params.tfaCode
		return this.api.post('/auth/2fa/sign', { twoFactorCode })
	}

	/**
	 * Get list user
	 * @param params
	 * @returns list user
	 */
	async getUsers(params?: UserQuery): Promise<Responsive<UserEntity[]>> {
		if (params && params.identifiers) {
			params.identifiers = Array.isArray(params.identifiers) ? params.identifiers.join(',') : params.identifiers
		}
		if (params && params.walletAddress) {
			params.walletAddress = Array.isArray(params.walletAddress) ? params.walletAddress.join(',') : params.walletAddress
		}
		if (params && params.defaultAddress) {
			params.defaultAddress = Array.isArray(params.defaultAddress) ? params.defaultAddress.join(',') : params.defaultAddress
		}
		if (params && params.ids) {
			params.ids = Array.isArray(params.ids) ? params.ids.join(',') : params.ids
		}
		const response = await this.api.get('/users', { params })
		return <Responsive<UserEntity[]>>this.dataFormatter(response)
	}

	/**
	 * Get user by id
	 * @param id
	 * @returns user
	 */
	async getUser(id: string): Promise<UserEntity> {
		const response = await this.api.get(`/users/${id}`)
		return <UserEntity>response.data
	}

	/**
	 * Update user info
	 * @param id
	 * @param body
	 * @returns user updated
	 */
	async updateUser(id: string, body: UpdateUser): Promise<UserEntity> {
		const response = await this.api.put(`/users/${id}`, body)
		return <UserEntity>response.data
	}

	/**
	 * Set token id
	 * @param tokenId
	 */
	async setTokenId(tokenId: string) {
		this._tokenId = tokenId
	}

	async setRefreshToken(refreshToken: string) {
		this._refreshToken = refreshToken
	}

	handleOnTokenChange(tokenId: string, refreshToken: string) {
		if (this._onTokenChange) {
			this._onTokenChange(tokenId, refreshToken)
		}
	}

	onTokenChange(callback: (tokenId: string, refreshToken: string) => void) {
		this._onTokenChange = callback
	}
	/**
	 * Upload file
	 * @param file
	 * @returns url of file
	 */
	async uploadFile(file: File): Promise<any> {
		const formData = new FormData()
		formData.append('file', file)

		const response = await this.api.post('/uploads', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
		return response
	}

	async verifyToken(): Promise<DecodedIdToken> {
		const res = await this.api.get('auth/verify-token')
		return <DecodedIdToken>res.data
	}

	async isEmailVerified(): Promise<boolean> {
		const decoded = await this.verifyToken()
		return decoded.email_verified || false
	}

	/**
	 * Format data
	 * @param response
	 * @returns
	 */
	protected dataFormatter(response: any): any {
		const data = response.data || []
		const meta = response.meta || {}

		return { data, meta }
	}
}
