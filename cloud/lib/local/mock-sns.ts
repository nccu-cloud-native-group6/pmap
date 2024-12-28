import { error } from 'console';
import { connect } from 'mqtt';

export const mqttClient = connect(
  'mqtt://localhost:1883',
  { keepalive: 5 },
);

mqttClient.on('connect', () => {
  console.log('MQTT connected');
  mqttClient.subscribe('backend-dev', (err) => {
    if (err) {
      console.log('MQTT subscription error: ' + err);
    }
  });
});

mqttClient.on('error', (err) => {
  console.log('MQTT connection error: ' + err);
});

mqttClient.on('message', async (topic, message) => {
  const msg = message.toString();
  console.log('MQTT message:', topic, msg);
  
  if(topicToCallbackMap.has(topic)) {
    const callbacks = topicToCallbackMap.get(topic)!;

    for (const callback of callbacks) {
      await callback(message.toString());
    }
  }
});

const topicToCallbackMap = new Map<string, ((message: string) => Promise<any>)[]>();

export function subscribeLocal(topic: string, callback: (message: string) => Promise<void>) {
  mqttClient.subscribe(topic, (err) => {
    if (err) {
      console.log(`Subscibe to ${topic} error: ` + error);
    }
  });

  if (!topicToCallbackMap.has(topic)) {
    topicToCallbackMap.set(topic, [callback]);
    return;
  }
  topicToCallbackMap.get(topic)!.push(callback);
}