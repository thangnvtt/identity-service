import { AuthUserEntity } from '../entities/user.entity'

export interface IAuthRepository {
	notify(user: AuthUserEntity): Promise<void>

	adminCreateUser(user: AuthUserEntity): Promise<AuthUserEntity>

	adminSignIn(identifier: string, password: string): Promise<AuthUserEntity>
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY'
