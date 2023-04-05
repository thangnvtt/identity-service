import { ConsoleLogger, Injectable } from '@nestjs/common'

export interface ILogger {
	info(message: any): void

	error(message: any): void

	warn(message: any): void

	debug(message: any): void
}
@Injectable()
export class LoggerService extends ConsoleLogger implements ILogger {
	info(message: any): void {
		super.log(JSON.stringify(message))
	}

	error(message: any): void {
		super.error(JSON.stringify(message))
	}

	warn(message: any): void {
		super.warn(JSON.stringify(message))
	}

	debug(message: any): void {
		super.debug(JSON.stringify(message))
	}
}
