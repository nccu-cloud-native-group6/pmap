import { handler } from '../../lambda-handler/fetch-weather';
import * as fs from 'node:fs/promises';
import { loadEnv } from '../config';

loadEnv();

async function testHandler() {
  try {
    const result = await handler();

    // Write data to file
    await fs.writeFile('cwa.json', result);
    console.log('Write finish:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testHandler();
