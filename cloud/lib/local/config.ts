import * as dotenv from 'dotenv';

export function loadEnv() {
  const env = process.env.NODE_ENV || 'dev';
  const envPath = `.env.${env}`;
  console.log(`Loading env from ${envPath}`);
  dotenv.config({ path: envPath });
}
