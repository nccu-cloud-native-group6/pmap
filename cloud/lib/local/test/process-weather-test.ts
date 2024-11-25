import { handler, unzipData } from '../../lambda-handler/process-weather';
import * as fs from 'fs';
import { loadEnv } from '../config';

loadEnv();

async function testHandler() {
  const returnedData = fs.readFileSync('cwa.json', 'utf-8');
  // unzip test
  const unzippedData = await unzipData(returnedData);
  // write to file
  fs.writeFileSync('cwa-unzipped.json', unzippedData);

  const mockEvent = {
    responsePayload: returnedData,
  };

  try {
    await handler(mockEvent);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testHandler();
