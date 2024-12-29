import { reportService } from '../../../../Infrastructure/Service/reportService.js';
import { s3Service } from '../../../../Infrastructure/Service/s3Service.js';
import logger from '../../../../Logger/index.js';
import { postReportRes } from './postReportRes.js';
import { PostReport } from './Types/api.js';

export const postReportHandler = {
  handle: async (
    body: PostReport.TAddReportReqBody,
    userId: number,
    file: Express.Multer.File | undefined,
  ): Promise<PostReport.IAddReportResponse> => {
    let permanentURL: string | null = null;
    if (file) {
      permanentURL = await s3Service.uploadReportImg(userId, file);
      if (permanentURL === null) {
        throw new Error('Failed to upload report img');
      }
    }
    await reportService.addReport(body, userId, permanentURL);
    const result = await postReportRes.customize(body, permanentURL);
    return result;
  },
};
