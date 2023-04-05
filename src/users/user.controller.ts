import { Controller, Get, Body, Param, Delete, Put, Query, Inject, Req } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PageOptionsDto } from 'src/utils/page-meta.dto'
import { UserQueryDto } from './dto/query-user.dto'
import { PageDto } from 'src/utils/page.dto'
import { IUserService, USER_SERVICES } from './interfaces/user.service.interface'
import { MainEventType } from 'src/proto-service/proto-event/main'
import { EventPattern, Payload } from '@nestjs/microservices'
import { UserEntity, UserProvider, UserState } from './entities/user.entity'
import { UtilsService } from 'src/utils/utils.service'
import { FIREBASE_ADMIN_SERVICE, IFirebaseAdminService } from 'src/firebase/interfaces'
@Controller('users')
export class UserController {
	constructor(
		@Inject(USER_SERVICES) private readonly userService: IUserService,
		private readonly utilsService: UtilsService,
		@Inject(FIREBASE_ADMIN_SERVICE) private readonly firebaseAdminService: IFirebaseAdminService,
	) {}

	@Get()
	findAll(@Query() pageOptionDto: PageOptionsDto, @Query() userQueryDto: UserQueryDto): Promise<PageDto<UserEntity>> {
		return this.userService.findAll(pageOptionDto, userQueryDto)
	}

	@Get(':id')
	findOne(@Param('id') id: string): Promise<UserEntity> {
		return this.userService.findById(id)
	}

	@Put(':id')
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		const userEntity = UpdateUserDto.toEntity(updateUserDto)
		return this.userService.update(id, userEntity)
	}

	@Delete(':id')
	delete(@Param('id') id: string) {
		return this.userService.delete(id)
	}

	@EventPattern(MainEventType.IDENTITY_USER)
	async createUserFromPubSub(@Payload() user) {
		// if (user.state !== UserState.INIT) return undefined
		// const userEntity = CreateUserDto.fromGCPubsubEvent(user)
		// const isAddress = this.utilsService.isWalletAddress(user.id)
		// if (isAddress) {
		// 	userEntity.walletAddress = userEntity.id
		// 	userEntity.provider = UserProvider.WALLET
		// }
		// const userCreated = await this.userService.create(userEntity)
		// if (userCreated.provider === UserProvider.PASSWORD) {
		// 	await this.userService.sendEmailVerifyUser(userCreated)
		// 	await this.firebaseAdminService.updateUser(userEntity.id, { disabled: true })
		// }
		// await this.userService.notify(userCreated)
		// return userCreated
	}
}
