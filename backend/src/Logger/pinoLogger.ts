import { pino } from 'pino';

import { Logger } from './interface.js';

export class PinoLogger implements Logger {
  private readonly logger: pino.Logger;

  constructor(
    options: pino.LoggerOptions,
    destinationStream?: pino.DestinationStream,
  ) {
    this.logger = pino(options, destinationStream);
  }

  trace(message: string, labels?: Record<string, any>): void {
    this.logger.trace({ msg: message, ...labels });
  }

  debug(message: string, labels?: Record<string, any>): void {
    this.logger.debug({ msg: message, ...labels });
  }

  info(message: string, labels?: Record<string, any>): void {
    this.logger.info({ msg: message, ...labels });
  }

  warn(message: string, labels?: Record<string, any>): void {
    this.logger.warn({ msg: message, ...labels });
  }

  error(error: unknown, message?: string, labels?: Record<string, any>): void {
    if (error instanceof Error) {
      this.logger.error({ err: error, ...labels }, message);
    } else {
      this.logger.error({ msg: error, ...labels });
    }
  }

  fatal(error: unknown, message?: string, labels?: Record<string, any>): void {
    if (error instanceof Error) {
      this.logger.fatal({ err: error, ...labels }, message);
    } else {
      this.logger.fatal({ msg: error, ...labels });
    }
  }
}
