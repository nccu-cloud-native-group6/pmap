import { Request, Response } from 'express';

import { InvalidInputError, NoTokenError } from '../Errors/errors.js';
import { validatePostReportReqBody } from '../App/Features/Report/PostReport/Types/postReportValidator.js';
import { postReportHandler } from '../App/Features/Report/PostReport/postReportHandler.js';
import logger from '../Logger/index.js';

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
};
