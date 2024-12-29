import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_REGION,
  BUCKET_NAME,
} = process.env;

if (
  !AWS_ACCESS_KEY_ID ||
  !AWS_SECRET_ACCESS_KEY ||
  !S3_BUCKET_REGION ||
  !BUCKET_NAME
) {
  throw new Error('Missing required environment variables for S3 client');
}

const s3Config: S3ClientConfig = {
  region: S3_BUCKET_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
};

const s3Client = new S3Client(s3Config);

export { BUCKET_NAME, s3Client };
