import { Readable } from 'stream';
import { BUCKET_NAME, s3Client } from '../../Database/fileServer/s3Client.js';
import {
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import logger from '../../Logger/index.js';
const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;
export const s3Service = {
  getImg: async (bucketName: string, key: string): Promise<Readable | null> => {
    try {
      const response = await s3Client.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );
      if (!response.Body) {
        return null;
      }
      const stream = response.Body as Readable;
      return stream;
    } catch (err) {
      logger.error(err, 'Error get image');
      return null;
    }
  },
  uploadReportImg: async (
    userId: number,
    sourceFile: Express.Multer.File,
  ): Promise<string | null> => {
    try {
      const headBucketCommand = new HeadBucketCommand({ Bucket: BUCKET_NAME });
      await s3Client.send(headBucketCommand);

      const fileExtension = sourceFile.mimetype.split('/')[1];
      const timestamp = Date.now();
      const filename = `${userId}-${timestamp}.${fileExtension}`;
      const putObjectCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: sourceFile.buffer,
        ContentType: sourceFile.mimetype,
      });

      await s3Client.send(putObjectCommand);
      const permanentURL = `${BACKEND_DOMAIN}/api/image/${BUCKET_NAME}/${filename}`;
      return permanentURL;
    } catch (err: any) {
      if (err.name === 'NotFound') {
        logger.error(err, `Bucket "${BUCKET_NAME}" does not exist.`);
      } else {
        logger.error(err, 'Error upload avatar');
      }
      return null;
    }
  },
};
