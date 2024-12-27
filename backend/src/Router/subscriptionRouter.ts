import express from 'express';
import { subscriptionController } from '../Controller/subscriptionController.js';
import wrapAsync from '../utils/wrapAsync.js';
import { jwtAuthentication } from '../Middlewares/auth.js';
const router = express.Router({ mergeParams: true });

router.post(
  '/',
  jwtAuthentication,
  wrapAsync(subscriptionController.createSubscription),
);

export default router;
