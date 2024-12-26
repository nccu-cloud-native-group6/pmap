import { PostReport } from './Types/api.js';
export const postReportRes = {
  customize: async (
    body: PostReport.TAddReportReqBody,
    permanentURL: string | null,
  ): Promise<PostReport.IAddReportResponse> => {
    return {
      data: {
        newReport: {
          ...body,
          photoUrl: permanentURL,
        },
      },
    };
  },
};
