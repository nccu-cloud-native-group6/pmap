import { RowDataPacket } from 'mysql2';
import { GetReportDetail } from './Types/api.js';

export const getReportDetailRes = {
  customize: async (
    report: RowDataPacket,
  ): Promise<GetReportDetail.IGetReportDetailResponse> => {
    return {
      data: {
        reportDetail: {
          location: {
            address: report.address,
            latlng: {
              lat: report.lat,
              lng: report.lng,
            },
            polygonId: report.polygonId,
          },
          rainDegree: report.rainDegree,
          photoUrl: report.photoUrl,
          comment: report.comment,
          reporterId: report.reporterId,
          reporterName: report.reporterName,
          reporterAvatar: report.reporterAvatar,
          reportedAt: report.reportedAt,
        },
      },
    };
  },
};
