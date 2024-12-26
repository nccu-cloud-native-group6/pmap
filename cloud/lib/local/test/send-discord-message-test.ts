import { handler } from '../../lambda-handler/send-discord-message';
import { loadEnv } from '../config';

loadEnv();

async function testHandler() {
  try {
    await handler({ responsePayload: {
      statusCode: 200,
      message: '測試',
    } });
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testHandler();
