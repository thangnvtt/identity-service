import { Injectable, Logger } from '@nestjs/common'
import { PubSub, Topic } from '@google-cloud/pubsub'
import { ConfigService } from '@nestjs/config'
import { ICloudPubSubService } from './interfaces/cloud-pub-sub.interfaces'
@Injectable()
export class CloudPubSubService implements ICloudPubSubService {
	private readonly logger = new Logger(CloudPubSubService.name)
	private readonly pubsub: PubSub

	constructor(private readonly configService: ConfigService) {
		const projectId = this.configService.get<string>('CLOUD_PROJECT_ID')
		this.pubsub = new PubSub({ projectId: projectId })
	}

	async getSubscriptionName(topicName: string): Promise<string> {
		return `user-identity-${topicName}-sub`
	}

	async createTopic(topicName: string): Promise<Topic> {
		const [topic] = await this.pubsub.createTopic(topicName)
		const subscriptionName = await this.getSubscriptionName(topicName)
		await this.pubsub.createSubscription(topicName, subscriptionName)
		return topic
	}

	async getTopic(topicName: string): Promise<Topic> {
		return this.pubsub.topic(topicName)
	}

	async publishProtoMessage(topicName: string, dataBuffer: any): Promise<void> {
		const topic = this.pubsub.topic(topicName)
		await topic.publishMessage({ data: dataBuffer })
	}

	async exists(topicName: string): Promise<boolean> {
		const [isExists] = await this.pubsub.topic(topicName).exists()
		if (isExists) return true
		return false
	}
}
