import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { USER_IDENTITY_TOPIC } from 'src/cloud-pub-sub/constants'
import { CLOUD_PUB_SUB_SERVICE, ICloudPubSubService } from 'src/cloud-pub-sub/interfaces/cloud-pub-sub.interfaces'
import { IProtoService, PROTO_SERVICE } from 'src/proto-service/interfaces/proto-service.interface'
import { UserEntity, UserState } from '../entities/user.entity'
import { IUserRepository } from '../interfaces/users.repositories.interface'
import * as moment from 'moment'
import { UserErrorMessage } from 'src/wallet-provider/constants'
import { PrismaErrorCode } from '../constants'
@Injectable()
export class UserRepository implements IUserRepository {
	constructor(
		@Inject(CLOUD_PUB_SUB_SERVICE)
		private readonly cloudPubSubService: ICloudPubSubService,

		@Inject(PROTO_SERVICE)
		private readonly protoService: IProtoService,

		private readonly prisma: PrismaService,
	) {}

	async findOne(query: any = {}): Promise<UserEntity> {
		const user = await this.prisma.user.findUnique({ where: query })
		return UserEntity.fromModel(user)
	}

	async notify(user: UserEntity): Promise<void> {
		const userEvent = await this.protoService.generateUserEvent(user)
		this.cloudPubSubService.publishProtoMessage(USER_IDENTITY_TOPIC, userEvent)
	}

	async create(data: UserEntity): Promise<UserEntity> {
		data.createdAt = moment().unix()
		data.state = UserState.CREATED

		const dataModel = UserEntity.toModel(data)
		const user = await this.prisma.user.create({ data: dataModel })
		return UserEntity.fromModel(user)
	}

	async findMany(query: any = {}): Promise<UserEntity[]> {
		const { skip, take, where, order } = query
		const users = await this.prisma.user.findMany({
			where: where,
			skip,
			take,
			orderBy: order,
		})
		return users.map(UserEntity.fromModel)
	}

	async findById(id: string): Promise<UserEntity> {
		if (!id) return undefined

		const user = await this.prisma.user.findUnique({ where: { id } })
		if (!user) return undefined

		return UserEntity.fromModel(user)
	}

	async delete(id: string): Promise<UserEntity> {
		if (!id) return undefined

		const user = await this.prisma.user.delete({ where: { id } })
		return UserEntity.fromModel(user)
	}

	async update(id: string, data: UserEntity): Promise<UserEntity> {
		data.updatedAt = moment().unix()
		data.state = UserState.UPDATED
		const dataModel = UserEntity.toModel(data)
		try {
			const user = await this.prisma.user.update({
				where: { id },
				data: dataModel,
			})

			return UserEntity.fromModel(user)
		} catch (err) {
			if (err.code === PrismaErrorCode.NOT_FOUND) {
				throw new NotFoundException(UserErrorMessage.NOT_FOUND)
			}
			throw err
		}
	}

	async findByEmail(email: string): Promise<UserEntity | undefined> {
		if (!email) return undefined

		const user = await this.prisma.user.findUnique({ where: { email } })
		if (!user) return undefined

		return UserEntity.fromModel(user)
	}

	async count(params: any = {}): Promise<number> {
		return this.prisma.user.count(params)
	}
}
