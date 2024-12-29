import { Report } from '../../Database/entity/report.js';
import pool from '../../Database/database.js';
import logger from '../../Logger/index.js';
import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
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
  getReportsByLngLatRadius: async (
    lng: number,
    lat: number,
    radius: number,
  ): Promise<RowDataPacket[]> => {
    // ST_Distance_Sphere 返回的單位是公尺
    const sql = `
        SELECT R.id,
            R.rainDegree,
            L.lat,
            L.lng,
            U.avatar
        FROM Reports AS R
        JOIN Locations AS L ON R.locationId = L.id
        LEFT JOIN Users AS U ON R.userId = U.id
        WHERE ST_Distance_Sphere(
                L.location_point,
                ST_SRID(POINT(?, ?), 4326)
              ) <= ?
        AND ABS(TIMESTAMPDIFF(MINUTE, R.createdAt, NOW())) <= ?
    `;
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(sql, [
        lng,
        lat,
        radius,
        60,
      ]);
      logger.info(`Get reports by lng lat radius: ${rows}`);

      return rows;
    } catch (error) {
      logger.error(error, `Error fetching reports by lng lat radius:`);
      throw error;
    }
  },
  getReportDetail: async (reportId: number): Promise<RowDataPacket | null> => {
    const sql = `
      SELECT
        L.lat,
        L.lng,
        L.address,
        L.polygonId,
        R.rainDegree,
        R.photoUrl,
        R.comment,
        U.id AS reporterId,
        U.name AS reporterName,
        U.avatar AS reporterAvatar,
        R.createdAt AS reportedAt
      FROM Reports R
      JOIN Locations L ON R.locationId = L.id
      JOIN Users U ON R.userId = U.id
      WHERE R.id = ?;
    `;
    try {
      const [rows] = await pool.query<RowDataPacket[]>(sql, [reportId]);
      if (rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      logger.error(error, `Error fetching report detail:`);
      throw error;
    }
  },
};
