import { Request, Response } from 'express';

import {
  InputEmptyError,
  InvalidInputError,
  NoTokenError,
} from '../Errors/errors.js';
import { validatePostReportReqBody } from '../App/Features/Report/PostReport/Types/postReportValidator.js';
import { postReportHandler } from '../App/Features/Report/PostReport/postReportHandler.js';
import logger from '../Logger/index.js';
import { getRangeReportHandler } from '../App/Features/Report/GetRangeReport/getRangeReportHandler.js';
import { getReportDetailHandler } from '../App/Features/Report/GetReportDetail/getReportDetailHandler.js';

export const reportController = {
  postReport: async (req: Request, res: Response): Promise<void> => {
    if (req.decodedToken === undefined) {
      throw new NoTokenError();
    }
    const { id: userId } = req.decodedToken;
    const file = req.file;

    const { data } = req.body;
    const reqBodyObj = JSON.parse(data);

    const validationErrors = await validatePostReportReqBody(reqBodyObj);
    if (validationErrors.length > 0) {
      throw new InvalidInputError(validationErrors.join(', '));
    }
    const response = await postReportHandler.handle(reqBodyObj, userId, file);
    res.status(200).json(response);
  },
  getReports: async (req: Request, res: Response): Promise<void> => {
    if (req.decodedToken === undefined) {
      throw new NoTokenError();
    }
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius);
    if (!lat || !lng || !radius) {
      throw new InputEmptyError();
    }

    const response = await getRangeReportHandler.handle({ lat, lng, radius });
    res.status(200).json(response);
  },
  getReportDetail: async (req: Request, res: Response): Promise<void> => {
    if (req.decodedToken === undefined) {
      throw new NoTokenError();
    }
    const reportId = req.params.reportId;
    if (!reportId) {
      throw new InputEmptyError();
    }
    const response = await getReportDetailHandler.handle(Number(reportId));
    res.status(200).json(response);
  },
};
