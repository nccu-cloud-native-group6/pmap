import { Report } from '../../Database/entity/report.js';
import pool from '../../Database/database.js';
import logger from '../../Logger/index.js';
import { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { PostReport } from '../../App/Features/Report/PostReport/Types/api.js';
export const reportRepo = {
  create: async (
    report: PostReport.INewReport,
    connection: PoolConnection,
  ): Promise<number> => {
    try {
      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO Reports (rainDegree, comment, photoUrl, userId, locationId, createdAt) VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP())',
        [
          report.rainDegree,
          report.comment,
          report.photoUrl,
          report.userId,
          report.locationId,
        ],
      );
      return result.insertId;
    } catch (error) {
      logger.error(error, `Error creating report:`);
      throw error;
    }
  },
};
