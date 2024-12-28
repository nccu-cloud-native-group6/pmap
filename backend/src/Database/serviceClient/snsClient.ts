import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

import logger from '../../Logger/index.js';
import { mqttClient } from '../messageQueue.js';

const {
  SNS_AWS_ACCESS_KEY,
  SNS_AWS_SECRET_ACCESS_KEY,
  SNS_TOPIC_UPDATE_WEATHER,
  AWS_REGION,
} = process.env;

if (
  !SNS_AWS_ACCESS_KEY ||
  !SNS_AWS_SECRET_ACCESS_KEY ||
  !SNS_TOPIC_UPDATE_WEATHER ||
  !AWS_REGION
) {
  throw new Error('Missing required environment variables for sns client');
}

interface ISNSClient {
  publish(topicArn: string, message: string): Promise<any>;
}

export const Topics = {
  COMPUTE_WEATHER: SNS_TOPIC_UPDATE_WEATHER,
} as const;

class AwsSNSClient implements ISNSClient {
  private client: SNSClient;

  constructor(accessKeyId: string, secretAccessKey: string, region: string) {
    logger.info('[AWS SNS] Initialized');
    this.client = new SNSClient({
      region: region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async publish(topicArn: string, message: string): Promise<void> {
    try {
      await this.client.send(
        new PublishCommand({
          Message: message,
          TopicArn: topicArn,
        }),
      );
    } catch (error) {
      logger.error(error, '[AWS SNS] Error publishing message');
    }
  }
}

/**
 * For local dev, use this mock sns client
 * It publishes message to the local message queue
 */
class MockSNSClient implements ISNSClient {
  constructor() {
    logger.info('[Mock SNS] Initialized');
  }

  async publish(topic: string, message: string): Promise<any> {
    try {
      await mqttClient.publishAsync(topic, message);
      logger.info(`[Mock SNS] Published message to ${topic}: ${message}`);
    } catch (error) {
      logger.error(error, '[Mock SNS] Error publishing message:');
    }
  }
}
//TODO: change custom evn
export const snsClient: ISNSClient =
  process.env.CUSTOM_ENV !== 'sprod'
    ? new AwsSNSClient(
        SNS_AWS_ACCESS_KEY!,
        SNS_AWS_SECRET_ACCESS_KEY!,
        AWS_REGION!,
      )
    : new MockSNSClient();
