import { Polygon } from '../../Database/entity/polygon.js';
import pool from '../../Database/database.js';
import logger from '../../Logger/index.js';

export const polygonRepo = {
  getPolygons: async (
    lat: number,
    lng: number,
    radius: number,
  ): Promise<Polygon[] | null> => {
    try {
      const [rows] = await pool.query<Polygon[]>(
        'SELECT * FROM Polygons WHERE ST_Distance_Sphere(POINT(centerLng, centerLat), POINT(?, ?)) <= ?',
        [lng, lat, radius],
      );
      return rows as Polygon[];
    } catch (error) {
      logger.error(
        error,
        `Error fetching polygon with lat ${lat}, lng ${lng}, radius ${radius}:`,
      );
    }
    return null;
  },
  findById: async (id: number): Promise<Polygon | null> => {
    try {
      const [rows] = await pool.query<Polygon[]>(
        'SELECT * FROM Polygons WHERE id = ?',
        [id],
      );
      if (rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      logger.error(error, `Error fetching polygon with id ${id}:`);
      throw error;
    }
  },
};
