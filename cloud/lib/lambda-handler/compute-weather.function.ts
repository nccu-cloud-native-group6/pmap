import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { Signer } from '@aws-sdk/rds-signer';
import * as mysql from 'mysql2/promise';

// RDS settings
// Using '!' (non-null assertion operator) to tell the TypeScript compiler that the DB settings are not null or undefined,
const host_name = process.env.DB_HOST!;
const port = parseInt(process.env.DB_PORT!);
const db_name = process.env.DB_NAME!;
const db_user_name = process.env.DB_USER_NAME!;
const aws_region = process.env.AWS_REGION!;

async function createAuthToken(): Promise<string> {
  try {
    // Create RDS Signer object
    const signer = new Signer({
      hostname: host_name,
      port: port,
      region: aws_region,
      username: db_user_name,
    });

    // Request authorization token from RDS
    const token = await signer.getAuthToken();
    console.log('Auth token created successfully.');
    return token;
  } catch (error) {
    console.error('Error creating auth token:', error);
    throw new Error(`Failed to create auth token: ${error}`);
  }
}

async function dbOps(): Promise<mysql.QueryResult | undefined> {
  try {
    // Obtain auth token
    const token = await createAuthToken();
    const conn = await mysql.createConnection({
      host: host_name,
      user: db_user_name,
      password: token,
      database: db_name,
      ssl: 'Amazon RDS', // Ensure you have the CA bundle for SSL connection
    });
    const [rows, fields] = await conn.execute('SELECT ? + ? AS sum', [3, 2]);
    console.log('result:', rows);
    return rows;
  } catch (err) {
    // Log detailed error info, including specific MySQL connection error
    if (err instanceof Error) {
      console.error('Database operation failed:', err.message, err.stack);
    } else {
      console.error('Unknown error occurred during DB operation:', err);
    }
  }
}

export const handler = async (
  event: APIGatewayEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  // Execute database flow
  const result = await dbOps();

  // Return error is result is undefined
  if (result == undefined)
    return {
      statusCode: 500,
      body: JSON.stringify(`Error with connection to DB host`),
    };

  // Return result
  return {
    statusCode: 200,
    body: JSON.stringify(`The selected sum is: ${result[0].sum}`),
  };
};
