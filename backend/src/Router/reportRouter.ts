import express from 'express';

import wrapAsync from '../utils/wrapAsync.js';
import { jwtAuthentication } from '../Middlewares/auth.js';
import { reportController } from '../Controller/reportController.js';
import { upload } from '../Middlewares/multer.js';
import { createRateLimiter } from '../Middlewares/ratelimit.js';
const router = express.Router();

// router.post('/', jwtAuthentication, wrapAsync(reportController.postReport));
router.post(
  '/',
  [createRateLimiter(1, 5), jwtAuthentication, upload.single('reportImg')],
  wrapAsync(reportController.postReport),
);

router.get(
  '/',
  [createRateLimiter(1, 5), jwtAuthentication],
  wrapAsync(reportController.getReports),
);
router.get(
  '/:reportId',
  [createRateLimiter(1, 5), jwtAuthentication],
  wrapAsync(reportController.getReportDetail),
);
export default router;
