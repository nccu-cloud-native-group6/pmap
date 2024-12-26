import { Request, Response } from 'express';
import mime from 'mime-types';
import { s3Service } from '../Infrastructure/Service/s3Service.js';
import logger from '../Logger/index.js';

export const imageController = {
  getImage: async (req: Request, res: Response): Promise<void> => {
    const { bucketName } = req.params;
    const key = req.params[0];

    if (!bucketName || !key) {
      throw new Error('Missing bucketName or key parameter');
    }
    const imgStream = await s3Service.getImg(bucketName, key);
    // TODO: 可以加上 cache (減少傳輸次數, 老師上次分享到的被打爆慘案)
    if (imgStream) {
      const contentType = mime.lookup(key) || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      imgStream.on('error', (err) => {
        logger.error(err, 'network error while streaming image');
        res.status(500).end();
      });
      imgStream.pipe(res);
    } else {
      throw new Error('Error get image');
    }
  },
};
