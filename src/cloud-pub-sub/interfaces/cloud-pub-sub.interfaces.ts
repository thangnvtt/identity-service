import { Topic } from '@google-cloud/pubsub'

export interface ICloudPubSubService {
	createTopic(topicName: string): Promise<Topic>

	getTopic(topicName: string): Promise<Topic>

	publishProtoMessage(topicName: string, message: any): Promise<void>
}

export const CLOUD_PUB_SUB_SERVICE = 'CLOUD PUB SUB SERVICE'
