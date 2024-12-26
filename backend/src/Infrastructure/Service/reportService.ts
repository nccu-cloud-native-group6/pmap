import { RowDataPacket } from 'mysql2/promise';
import { GetRangeReport } from '../../App/Features/Report/GetRangeReport/Types/api.js';
import { PostReport } from '../../App/Features/Report/PostReport/Types/api.js';
import pool from '../../Database/database.js';
import logger from '../../Logger/index.js';
import { locationRepo } from '../Repository/locationRepo.js';
import { polygonRepo } from '../Repository/polygonRepo.js';
import { reportRepo } from '../Repository/reportRepo.js';
import { notificationService } from './notificationService.js';

export const reportService = {
  addReport: async (
    body: PostReport.TAddReportReqBody,
    userId: number,
    permanentURL: string | null,
  ): Promise<void> => {
    if ((await polygonRepo.findById(body.location.polygonId)) === null) {
      throw new Error('Polygon should exist');
    }

    const location = await locationRepo.findByAddressAndLngAndLat(
      body.location.address,
      body.location.latlng.lng,
      body.location.latlng.lat,
    );

    const connection = await pool.getConnection();
    try {
      const newReport: PostReport.INewReport = {
        comment: body.comment,
        photoUrl: permanentURL,
        rainDegree: body.rainDegree,
        userId: userId,
        locationId: location?.id,
      };
      await connection.beginTransaction();

      if (location === null) {
        const newLocationId = await locationRepo.create(
          body.location,
          connection,
        );
        newReport.locationId = newLocationId;
      }
      await reportRepo.create(newReport, connection);
      await connection.commit();
      if (body.location.polygonId !== undefined) {
        await notificationService.onNewReport(
          body.location.polygonId,
          body.rainDegree,
          result,
        );
      } else {
        throw new Error('Polygon ID should not be undefined');
      }
      return result;
    } catch (error) {
      await connection.rollback();
      logger.error(error, 'Error report');
      throw error;
    } finally {
      connection.release();
    }
  },
  getRangeReports: async (
    params: GetRangeReport.TGetRangeReportParams,
  ): Promise<GetRangeReport.IGetRangeReportResponse['data']['reports']> => {
    const reports: RowDataPacket[] = await reportRepo.getReportsByLngLatRadius(
      params.lng,
      params.lat,
      params.radius,
    );
    return reports.map((row) => ({
      id: row.id,
      rainDgreee: row.rainDegree,
      latlng: {
        lat: row.lat,
        lng: row.lng,
      },
      reporterAvatar: row.reporterAvatar,
    }));
  },
  getReportDetail: async (reportId: number): Promise<RowDataPacket> => {
    const report = await reportRepo.getReportDetail(reportId);
    if (report === null) {
      throw new Error('Report should exist');
    }
    return report;
  },
  triggerWeatherComputing: async (): Promise<void> => {
    snsClient.publish(Topics.COMPUTE_WEATHER, 'backend');
  },
  startReportTriggerWeatherComputing: () => {
    const WATCH_INTERVAL_MS = 2000;

    setInterval(async () => {
      if (reportService.hasNewReport) {
        await reportService.triggerWeatherComputing();
        reportService.hasNewReport = false;
      }
    }, WATCH_INTERVAL_MS);
  },
  hasNewReport: false,
};
