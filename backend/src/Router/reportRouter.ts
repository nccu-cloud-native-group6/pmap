import express from 'express';

import wrapAsync from '../utils/wrapAsync.js';
import { jwtAuthentication } from '../Middlewares/auth.js';
import { reportController } from '../Controller/reportController.js';
import { upload } from '../Middlewares/multer.js';
const router = express.Router();

// router.post('/', jwtAuthentication, wrapAsync(reportController.postReport));
router.post(
  '/',
  [jwtAuthentication, upload.single('reportImg')],
  wrapAsync(reportController.postReport),
);

router.post('/', jwtAuthentication, wrapAsync(reportController.postReport));
router.get('/', jwtAuthentication, wrapAsync(reportController.getReports));
router.get(
  '/:reportId',
  jwtAuthentication,
  wrapAsync(reportController.getReportDetail),
);
export default router;
