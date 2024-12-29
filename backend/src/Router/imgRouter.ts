import express from 'express';
import wrapAsync from '../utils/wrapAsync.js';
import { imageController } from '../Controller/imageController.js';
import { createRateLimiter } from '../Middlewares/ratelimit.js';
const router = express.Router();

router.get(
  '/:bucketName/*',
  createRateLimiter(1, 10),
  wrapAsync(imageController.getImage),
);

export default router;
