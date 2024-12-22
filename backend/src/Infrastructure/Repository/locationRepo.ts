import logger from '../../Logger/index.js';
import pool from '../../Database/database.js';
import { Location } from '../../Database/entity/location.js';
import { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { PostReport } from '../../App/Features/Report/PostReport/Types/api.js';
export const locationRepo = {
  findByLngAndLat: async (
    lng: number,
    lat: number,
  ): Promise<Location | null> => {
    try {
      const [rows] = await pool.query<Location[]>(
        'SELECT * FROM Locations WHERE lat = ? AND lng = ?',
        [lng, lat],
      );
      if (rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      logger.error(
        error,
        `Error fetching location with lat ${lat}, lng ${lng}:`,
      );
      throw error;
    }
  },
  findByAddressAndLngAndLat: async (
    address: string,
    lng: number,
    lat: number,
  ): Promise<Location | null> => {
    try {
      const [rows] = await pool.query<Location[]>(
        'SELECT * FROM Locations WHERE lat = ? AND lng = ? AND address = ?',
        [lat, lng, address],
      );
      if (rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      logger.error(
        error,
        `Error fetching location with lat ${lat}, lng ${lng}, address ${address}:`,
      );
      throw error;
    }
  },
  findByAddress: async (address: string): Promise<Location | null> => {
    try {
      const [rows] = await pool.query<Location[]>(
        'SELECT * FROM Locations WHERE address = ?',
        [address],
      );
      if (rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      logger.error(error, `Error fetching location with address ${address}:`);
      throw error;
    }
  },
  create: async (
    location: PostReport.TAddReportReqBody['location'],
    connection: PoolConnection,
  ): Promise<number> => {
    try {
      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO Locations (lat, lng, address, polygonId, createdAt) VALUES (?, ?, ?, ?, UTC_TIMESTAMP())',
        [
          location.latlng.lat,
          location.latlng.lng,
          location.address,
          location.polygonId,
        ],
      );
      return result.insertId;
    } catch (error) {
      logger.error(error, `Error creating location:`);
      throw error;
    }
  },
};
