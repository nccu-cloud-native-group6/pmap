// When locally developing, use this process to run the cloud functions locally

// Currently, manually chains the functions together
// Maybe use some aws local testing tool like localstack or moto later

import * as cron from 'node-cron';
import { loadEnv } from './config';
import { handler as fetchWeatherHandler } from '../lambda-handler/fetch-weather';
import { handler as processWeatherHandler } from '../lambda-handler/process-weather';
import { handler as computeWeatherHandler } from '../lambda-handler/compute-weather';

loadEnv();

async function main() {
  cron.schedule('*/10 * * * *', async () => {
    console.log('Trigger weather pipeline');
    await startWeatherPipeline();
  });
}

async function startWeatherPipeline() {
  const rep = await fetchWeatherHandler();
  await processWeatherHandler({ responsePayload: rep });

  // Should be trigger the sns first, and then sns trigger the next lambda
  // But for simplicity, just call the next lambda directly
  await computeWeatherHandler();
}

main();
