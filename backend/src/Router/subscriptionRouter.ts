import express from 'express';
import { subscriptionController } from '../Controller/subscriptionController.js';
import wrapAsync from '../utils/wrapAsync.js';
import { jwtAuthentication } from '../Middlewares/auth.js';
import { createRateLimiter } from '../Middlewares/ratelimit.js';
const router = express.Router({ mergeParams: true });

router.post(
  '/',
  [createRateLimiter(1, 5), jwtAuthentication],
  wrapAsync(subscriptionController.createSubscription),
);

router.get(
  '/',
  jwtAuthentication,
  wrapAsync(subscriptionController.getSubscriptions),
);

router.delete(
  '/:subscriptionId',
  jwtAuthentication,
  wrapAsync(subscriptionController.deleteSubscription),
);

export default router;
