import { PostReport } from './Types/api.js';
export const postReportRes = {
  customize: async (
    newReportId: number,
  ): Promise<PostReport.IAddReportResponse> => {
    return {
      data: {
        newReportId,
      },
    };
  },
};
