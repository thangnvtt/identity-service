import { Body, Controller, Inject, Post } from '@nestjs/common'
import { AdminSignInDto } from './dto/admin-sign-in.dto'
import { AUTH_SERVICE, IAuthService } from './interfaces/auth.service.interface'

@Controller('admin/auth')
export class AdminAuthController {
	constructor(@Inject(AUTH_SERVICE) private readonly authService: IAuthService) {}

	@Post('login')
	signIn(@Body() adminSignIn: AdminSignInDto) {
		const { identifier, password } = adminSignIn
		return this.authService.adminSignIn(identifier, password)
	}
}
