import { GetRangeReport } from './Types/api.js';

export const getRangeReportRes = {
  customize: async (
    result: GetRangeReport.IGetRangeReportResponse['data']['reports'],
  ): Promise<GetRangeReport.IGetRangeReportResponse> => {
    return {
      data: {
        reports: result,
      },
    };
  },
};
