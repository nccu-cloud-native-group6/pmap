import { handler } from '../../lambda-handler/compute-weather';
import { loadEnv } from '../config';

loadEnv();

async function testHandler() {
  try {
    const result = await handler();

    console.log(result);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testHandler();
