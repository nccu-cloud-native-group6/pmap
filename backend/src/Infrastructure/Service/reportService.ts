import { RowDataPacket } from 'mysql2/promise';
import { GetRangeReport } from '../../App/Features/Report/GetRangeReport/Types/api.js';
import { PostReport } from '../../App/Features/Report/PostReport/Types/api.js';
import pool from '../../Database/database.js';
import logger from '../../Logger/index.js';
import { locationRepo } from '../Repository/locationRepo.js';
import { polygonRepo } from '../Repository/polygonRepo.js';
import { reportRepo } from '../Repository/reportRepo.js';

export const reportService = {
  addReport: async (
    body: PostReport.TAddReportReqBody,
    userId: number,
  ): Promise<number> => {
    if ((await polygonRepo.findById(body.location.polygonId)) === null) {
      throw new Error('Polygon should exist');
    }
    // 發現用 api-gen 有個缺點就是沒辦法在coding 時確定細部的 type 型態或有沒有娶到正確的位置，要翻到 api.d.ts 來手動查看
    const location = await locationRepo.findByAddressAndLngAndLat(
      body.location.address,
      body.location.latlng.lng,
      body.location.latlng.lat,
    );
    const connection = await pool.getConnection();
    try {
      const newReport: PostReport.INewReport = {
        comment: body.comment,
        photoUrl: body.photoUrl,
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
      const result = await reportRepo.create(newReport, connection);
      await connection.commit();
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
    }));
  },
};
