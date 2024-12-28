import { handler } from '../../lambda-handler/send-discord-message';
import { loadEnv } from '../config';

loadEnv();

async function testHandler() {
  // Event format 1:
  try {
    await handler({
      responsePayload: {
        statusCode: 200,
        message: '測試',
      },
    });
  } catch (error) {
    console.error('Test failed:', error);
  }

  // Event format 2 (lambda-destionation on-failure):
  try {
    await handler({
      version: '1.0',
      timestamp: '2024-12-28T07:13:09.891Z',
      requestContext: {
        requestId: 'd504cbea-eb99-4601-b61c-d594fc6fea3d',
        functionArn:
          'arn:aws:lambda:ap-northeast-1:203918887121:function:CloudStack-fetchweatherC769A7ED-8gf8MnoABeHp:$LATEST',
        condition: 'RetriesExhausted',
        approximateInvokeCount: 3,
      },
      requestPayload: {
        version: '0',
        id: 'f6b5da9e-f839-4ce8-8951-41d5c4497427',
        'detail-type': 'Scheduled Event',
        source: 'aws.events',
        account: '203918887121',
        time: '2024-12-28T07:10:00Z',
        region: 'ap-northeast-1',
        resources: [
          'arn:aws:events:ap-northeast-1:203918887121:rule/CloudStack-Rule4C995B7F-gpnzOVlTsOgl',
        ],
        detail: {},
      },
      responseContext: {
        statusCode: 200,
        executedVersion: '$LATEST',
        functionError: 'Unhandled',
      },
      responsePayload: {
        errorType: 'Error',
        errorMessage: 'Failed to get address',
        trace: [
          'Error: Failed to get address',
          '    at /var/task/index.js:14328:15',
          '    at Array.map (<anonymous>)',
          '    at addAddress (/var/task/index.js:14324:14)',
          '    at fetchCwaData (/var/task/index.js:14285:44)',
          '    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)',
          '    at async main (/var/task/index.js:14274:17)',
          '    at async Runtime.handler (/var/task/index.js:14271:10)',
        ],
      },
    });
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testHandler();
