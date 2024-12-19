import express from 'express';
import { authController } from '../Controller/authController.js';
import wrapAsync from '../utils/wrapAsync.js';
const router = express.Router();

// router.get('/callback/google', wrapAsync(authController.googleOauth));
router.post('/signup', wrapAsync(authController.signUp));
router.post('/nativeSignin', wrapAsync(authController.signIn));
export default router;
