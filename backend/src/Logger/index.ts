import { multistream } from 'pino';
// import pinoLoki from 'pino-loki';

import { PinoLogger } from './pinoLogger.js';
const streams = [{ stream: process.stdout }];

const logger = new PinoLogger(
  {
    enabled: process.env.LOGGING_ENABLED === 'true',
  },
  multistream(streams),
);

export default logger;
