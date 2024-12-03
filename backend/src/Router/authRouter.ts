import express from 'express';
import { authController } from '../Controller/authController.js';
import wrapAsync from '../utils/wrapAsync.js';
const router = express.Router();

router.post('/callback/google', wrapAsync(authController.googleOauth));

export default router;
