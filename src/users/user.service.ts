import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Prisma } from '@prisma/client'
import { totp } from 'otplib'
import { ConfirmUserEventName } from 'src/auth/entities'
import { PageMetaDto, PageOptionsDto } from 'src/utils/page-meta.dto'
import { PageDto } from 'src/utils/page.dto'
import { UserErrorMessage } from 'src/wallet-provider/constants'
import { UserQueryDto, WhereUser } from './dto/query-user.dto'
import { UserEntity } from './entities/user.entity'
import { IUserService } from './interfaces/user.service.interface'
import { IUserRepository, USER_REPOSITORY } from './interfaces/users.repositories.interface'
import * as crypto from 'crypto'
@Injectable()
export class UserService implements IUserService {
	private readonly logger = new Logger(UserService.name)

	constructor(
		@Inject(USER_REPOSITORY) private userRepository: IUserRepository,
		private readonly evenEmitter: EventEmitter2,
		private configService: ConfigService,
	) {}

	async findOne(userQueryDto: UserQueryDto): Promise<UserEntity> {
		const whereUser = new WhereUser(userQueryDto)

		const whereParams: Prisma.UserWhereInput = whereUser.query
		const users = await this.userRepository.findMany({ where: whereParams })

		if (!users.length) return undefined
		return users[0]
	}

	async notify(user: UserEntity): Promise<void> {
		await this.userRepository.notify(user)
		this.logger.log(`Publish successfully ${JSON.stringify(user)}`)
	}

	async create(user: UserEntity): Promise<UserEntity> {
		const userById = await this.userRepository.findById(user.id)
		if (userById) throw new BadRequestException(UserErrorMessage.EXISTED_ID)

		const userByEmail = await this.userRepository.findByEmail(user.email)
		if (userByEmail) throw new BadRequestException(UserErrorMessage.EXISTED_EMAIL)

		const inputUser = {
			signed_up_at: Date.now(),
			...user,
		}

		const createdUser = await this.userRepository.create(inputUser)
		return createdUser
	}

	async sendEmailVerifyUser(user: UserEntity): Promise<void> {
		totp.options = { digits: Number(this.configService.get('NUMBER_DIGITS')), step: Number(this.configService.get('TLS_VERIFICATION_CODE')) }
		const hashFromId = this.getHash(user.id)
		const verificationCode = totp.generate(hashFromId)
		this.evenEmitter.emit(ConfirmUserEventName, { nickName: user.nickName, email: user.email, code: verificationCode })
	}

	async findAll(pageOptionsDto?: PageOptionsDto, userQueryDto?: UserQueryDto): Promise<PageDto<UserEntity>> {
		const { pageSize } = pageOptionsDto
		const skip = pageOptionsDto.skip

		const whereUser = new WhereUser(userQueryDto)

		const whereParams: Prisma.UserWhereInput = whereUser.query
		const order = whereUser.orders

		const totalRecord = await this.userRepository.count({ where: whereParams })

		const entities = await this.userRepository.findMany({
			skip,
			take: pageSize,
			order,
			where: whereParams,
		})

		const pageMetaDto = new PageMetaDto({ totalRecord, pageOptionsDto })

		return new PageDto(entities, pageMetaDto)
	}

	async findById(id: string): Promise<UserEntity> {
		const user = await this.userRepository.findById(id)
		if (user) return user
		return null
	}

	async update(id: string, body: UserEntity): Promise<UserEntity> {
		const newUser = await this.userRepository.update(id, body)
		if (newUser) return newUser
		throw new NotFoundException(UserErrorMessage.NOT_FOUND)
	}

	async delete(id: string): Promise<UserEntity> {
		return this.userRepository.delete(id)
	}

	getHash(id: string): string {
		return crypto.createHash('sha256').update(id).digest('hex')
	}
}
