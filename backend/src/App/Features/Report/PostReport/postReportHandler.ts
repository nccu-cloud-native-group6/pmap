import { reportService } from '../../../../Infrastructure/Service/reportService.js';
import { postReportRes } from './postReportRes.js';
import { PostReport } from './Types/api.js';

export const postReportHandler = {
  handle: async (
    body: PostReport.TAddReportReqBody,
    userId: number,
  ): Promise<PostReport.IAddReportResponse> => {
    const newReportId = await reportService.addReport(body, userId);
    const result = await postReportRes.customize(newReportId);
    return result;
  },
};
