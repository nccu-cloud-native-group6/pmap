// When locally developing, use this process to run the cloud functions locally

// Currently, manually chains the functions together
// Maybe use some aws local testing tool like localstack or moto later

import * as cron from 'node-cron';
import { loadEnv } from './config';
import { handler as fetchWeatherHandler } from '../lambda-handler/fetch-weather';
import { handler as processWeatherHandler } from '../lambda-handler/process-weather';
import { handler as computeWeatherHandler } from '../lambda-handler/compute-weather';
import { handler as sendDcMessageHandler } from '../lambda-handler/send-discord-message';

// Change this to true if you want to test notification
const ENABLE_NOTIFICATION=false;
import { subscribeLocal } from './mock-sns';

loadEnv();

const SNS_TOPIC_UPDATE_WEATHER = 'update-weather-dev';

async function main() {

  // u can use the following command to trigger weather pipeline manually
  // > mqtt pub -t 'update-weather-dev' m "hello"
  subscribeLocal(SNS_TOPIC_UPDATE_WEATHER, async (msg) => {
    console.log('Subscribe message from local:', msg);
    await computeWeatherHandler();
  });
  
  await init();
  cron.schedule('*/10 * * * *', async () => {
    console.log('Trigger weather pipeline');
    await startWeatherPipeline();
  });
}

// 初始先跑一次，避免 avgRainDegree 一開始是 null
async function init() {
  await startWeatherPipeline();
}
async function startWeatherPipeline() {
  const rep = await fetchWeatherHandler();
  await processWeatherHandler({ responsePayload: rep });

  // Should be trigger the sns first, and then sns trigger the next lambda
  // But for simplicity, just call the next lambda directly
  const computedResp = await computeWeatherHandler();
  
  if (ENABLE_NOTIFICATION) {
    await sendDcMessageHandler({ responsePayload: computedResp });
  }
}

main();
