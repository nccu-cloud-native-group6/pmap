import { Request, Response } from 'express';
import mime from 'mime-types';
import { s3Service } from '../Infrastructure/Service/s3Service.js';
import logger from '../Logger/index.js';
import { redis } from '../Database/redis.js';
const MAX_CACHE_SIZE = 5 * 1024 * 1024;
export const imageController = {
  getImage: async (req: Request, res: Response): Promise<void> => {
    const { bucketName } = req.params;
    const key = req.params[0];

    if (!bucketName || !key) {
      throw new Error('Missing bucketName or key parameter');
    }
    const meta = await s3Service.headImg(bucketName, key);
    if (!meta) {
      res.status(404).send('File not found');
      return;
    }
    const { ContentLength, ETag, LastModified, ContentType } = meta;

    const cacheKey = `image:${bucketName}:${key}`;
    const shouldCache = ContentLength && ContentLength <= MAX_CACHE_SIZE;

    const ifNoneMatch = req.headers['if-none-match'];
    const ifModifiedSince = req.headers['if-modified-since'];
    const cleanETag = ETag?.replace(/"/g, '');
    const clientETag = ifNoneMatch?.replace(/"/g, '');

    const lastModifiedStr = LastModified
      ? new Date(LastModified).toUTCString()
      : undefined;
    const clientIfModifiedSince = ifModifiedSince
      ? new Date(ifModifiedSince).getTime()
      : 0;
    const serverLastModified = LastModified
      ? new Date(LastModified).getTime()
      : 0;

    if (cleanETag && clientETag && cleanETag === clientETag) {
      // 客戶端 ETag 與伺服器相同，直接回傳 304
      res.status(304).end();
      return;
    } else if (
      lastModifiedStr &&
      clientIfModifiedSince &&
      clientIfModifiedSince >= serverLastModified
    ) {
      // If-Modified-Since >= 伺服器最後更新時間
      res.status(304).end();
      return;
    }
    if (shouldCache) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        // 從 Redis 取到快取
        const imgBuffer = Buffer.from(cached, 'base64');
        // 設定回傳標頭
        res.setHeader(
          'Content-Type',
          ContentType || mime.lookup(key) || 'application/octet-stream',
        );
        // 加入 Cache-Control, ETag, Last-Modified
        res.setHeader('Cache-Control', 'public, max-age=3600, immutable');
        if (ETag) res.setHeader('ETag', ETag);
        if (LastModified) {
          res.setHeader('Last-Modified', new Date(LastModified).toUTCString());
        }
        res.send(imgBuffer);
        return;
      }
    }

    // --- 第四步：若 Redis 無快取，則去 S3 拿檔案 ---
    const stream = await s3Service.getImg(bucketName, key);
    if (!stream) {
      throw new Error('Error get image');
    }

    // 設定回傳的 Content-Type
    res.setHeader(
      'Content-Type',
      ContentType || mime.lookup(key) || 'application/octet-stream',
    );

    // 加入 Cache-Control, ETag, Last-Modified 等
    res.setHeader('Cache-Control', 'public, max-age=3600, immutable');
    if (ETag) res.setHeader('ETag', ETag);
    if (LastModified) {
      res.setHeader('Last-Modified', new Date(LastModified).toUTCString());
    }

    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('error', (err) => {
      logger.error(err, 'network error while streaming image');
      return res.status(500).send('Error reading from S3');
    });
    stream.on('end', async () => {
      const finalBuffer = Buffer.concat(chunks);
      res.send(finalBuffer);

      // --- 第五步：寫入 Redis (若 shouldCache = true) ---
      if (shouldCache) {
        try {
          await redis.set(
            cacheKey,
            finalBuffer.toString('base64'),
            'EX',
            60 * 60,
          );
        } catch (err) {
          logger.error(err, 'Error caching image to Redis');
        }
      }
    });
    // const imgStream = await s3Service.getImg(bucketName, key);
    // // TODO: 可以加上 cache (減少傳輸次數, 老師上次分享到的被打爆慘案)
    // if (imgStream) {
    //   const contentType = mime.lookup(key) || 'application/octet-stream';
    //   res.setHeader('Content-Type', contentType);
    //   imgStream.on('error', (err) => {
    //     logger.error(err, 'network error while streaming image');
    //     res.status(500).end();
    //   });
    //   imgStream.pipe(res);
    // } else {
    //   throw new Error('Error get image');
    // }
  },
};
