import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { TransformInterceptor } from './interceptors/transform.interceptor'
import { AllExceptionsFilter } from './all-exceptions'
import { LoggerService } from './logger/logger.service'
import { ValidationPipe } from '@nestjs/common'
import { IdentityUserUserEventDeserializer } from './proto-service/deserilizer.serivce'
import { CloudPubSubServer } from './cloud-pub-sub/cloud-pub-sub.server'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

enum NODE_ENV {
	DEVELOPMENT = 'development',
}
async function bootstrap() {
	const port = process.env.PORT || 3000
	const app = await NestFactory.create(AppModule, { bufferLogs: true })
	const configService = app.get(ConfigService)
	const nodeEnv = configService.get('NODE_ENV')
	const pubsubTopic = configService.get('PUBSUB_TOPIC')
	const pubsubProjectId = configService.get('CLOUD_PROJECT_ID')
	const pubsubSubscriptionId = configService.get('PUBSUB_SUBSCRIPTION_ID')

	app.useGlobalInterceptors(new TransformInterceptor())
	app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)))
	app.useLogger(app.get(LoggerService))
	app.useGlobalPipes(new ValidationPipe({ transform: true, enableDebugMessages: true }))
	app.connectMicroservice({
		strategy: new CloudPubSubServer({
			topic: pubsubTopic,
			client: {
				projectId: pubsubProjectId,
			},
			subscription: pubsubSubscriptionId,
			noAck: true,
			deserializer: new IdentityUserUserEventDeserializer(),
		}),
	})

	await app.startAllMicroservices()

	const config = new DocumentBuilder()
		.setTitle('Identity User')
		.setDescription('The Identity User API description')
		.setVersion('1')
		.addTag('Identity User')
		.build()
	const document = SwaggerModule.createDocument(app, config)

	if (nodeEnv === NODE_ENV.DEVELOPMENT) SwaggerModule.setup('swagger', app, document)

	await app.listen(port)
}
bootstrap()
