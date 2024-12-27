import { connect } from 'mqtt';
import logger from '../Logger/index.js';

export const mqttClient = connect(
  `mqtt://${process.env.MQ_HOST}:${process.env.MQ_PORT}`,
  { keepalive: 5 },
);

mqttClient.on('connect', () => {
  logger.info('MQTT connected');
});

mqttClient.on('error', (err) => {
  logger.error('MQTT connection error: ' + err);
});

// TODO: remove this function
// It is just a test for testing mqtt is working
export async function sendToNotificationServer(notifications: string) {
  console.log(notifications);
  mqttClient.publish('WEBSOCKET', notifications, (err) => {
    if (err) {
      logger.info('Publish error: ' + err);
      return;
    }
    logger.info(
      'Published to SOCKET topic (send notifications to socket server)',
    );
  });
  mqttClient.publish('EMAIL', notifications, (err) => {
    if (err) {
      logger.info('Publish error: ' + err);
      return;
    }
    logger.info(
      'Published to EMAIL topic (send notifications to email server)',
    );
  });
}
