import express from 'express';
import wrapAsync from '../utils/wrapAsync.js';
import { imageController } from '../Controller/imageController.js';

const router = express.Router();

router.get('/:bucketName/*', wrapAsync(imageController.getImage));

export default router;
