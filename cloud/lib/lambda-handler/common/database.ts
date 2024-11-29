import { Signer } from '@aws-sdk/rds-signer';
import * as mysql from 'mysql2/promise';

export async function createAuthToken(
  host_name: string,
  port: number,
  aws_region: string,
  db_user_name: string,
): Promise<string> {
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

export async function connect(
  host_name: string,
  port: number,
  aws_region: string,
  db_name: string,
  db_user_name: string,
  db_password: string,
) {
  if (db_password === '' || db_password === undefined) {
    return connectToDbIam(host_name, port, db_user_name, aws_region, db_name);
  }
  return connectToDbPassword(
    host_name,
    port,
    db_name,
    db_user_name,
    db_password,
  );
}

export async function connectToDbIam(
  host_name: string,
  port: number,
  db_user_name: string,
  aws_region: string,
  db_name: string,
): Promise<mysql.Connection> {
  console.log('Connecting to DB using IAM authentication');
  const token = await createAuthToken(
    host_name,
    port,
    aws_region,
    db_user_name,
  );
  return mysql.createConnection({
    host: host_name,
    user: db_user_name,
    password: token,
    database: db_name,
    ssl: 'Amazon RDS',
  });
}

export async function connectToDbPassword(
  host_name: string,
  port: number,
  db_name: string,
  db_user_name: string,
  db_password: string,
) {
  console.log('Connecting to DB using password authentication');
  return mysql.createConnection({
    host: host_name,
    user: db_user_name,
    password: db_password,
    database: db_name,
    port: port,
  });
}
