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
    } catch (error) {
      await connection.rollback();
      logger.error(error, 'Error report');
      throw error;
    } finally {
      connection.release();
    }
  },
};
