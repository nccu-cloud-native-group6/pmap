import { reportService } from '../../../../Infrastructure/Service/reportService.js';
import { getRangeReportRes } from './getRangeReportRes.js';

import { GetRangeReport } from './Types/api.js';

export const getRangeReportHandler = {
  handle: async (
    params: GetRangeReport.TGetRangeReportParams,
  ): Promise<GetRangeReport.IGetRangeReportResponse> => {
    const result = await reportService.getRangeReports(params);

    return getRangeReportRes.customize(result);
  },
};
