import { BadRequestException, CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { SignInErrorMessage } from 'src/firebase/constants'
import { ITwoFactorAuthService, TWO_FACTOR_AUTH } from 'src/two-factor/interfaces/two-factor.service.interface'
import { IUserService, USER_SERVICES } from 'src/users/interfaces/user.service.interface'

@Injectable()
export class TwoFactorAuthGuard implements CanActivate {
	constructor(
		@Inject(TWO_FACTOR_AUTH) private readonly twoFactorService: ITwoFactorAuthService,
		@Inject(USER_SERVICES) private readonly userService: IUserService,
	) {}

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest()

		if (!request.user) throw new UnauthorizedException()
		const user = await this.userService.findById(request.user.id)
		const { twoFactorCode } = request.body

		if (!twoFactorCode) {
			throw new BadRequestException(SignInErrorMessage.MISSING_TWO_FACTOR_PASSWORD)
		}
		if (!user?.twoFactorAuthenticationSecret) throw new UnauthorizedException(SignInErrorMessage.SCAN_QR_CODE)

		const isCodeValid = await this.twoFactorService.isTwoFactorAuthenticationCodeValid(
			twoFactorCode.toString(),
			user.twoFactorAuthenticationSecret,
		)
		if (!isCodeValid) {
			throw new UnauthorizedException(SignInErrorMessage.WRONG_PASSWORD_SECOND)
		}

		return true
	}
}
