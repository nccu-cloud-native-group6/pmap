import { reportService } from '../../../../Infrastructure/Service/reportService.js';
import { getReportDetailRes } from './getReportDetailRes.js';
import { GetReportDetail } from './Types/api.js';

export const getReportDetailHandler = {
  handle: async (
    reportId: number,
  ): Promise<GetReportDetail.IGetReportDetailResponse> => {
    const result = await reportService.getReportDetail(reportId);

    return await getReportDetailRes.customize(result);
  },
};
