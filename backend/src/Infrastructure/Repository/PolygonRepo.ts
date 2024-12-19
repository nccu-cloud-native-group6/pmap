import { Polygon } from '../../Database/entity/polygon.js';
import pool from '../../Database/database.js';

export const polygonRepo = {
  getPolygons: async (
    lat: number,
    lng: number,
    radius: number,
  ): Promise<Polygon[] | null> => {
    try {
      const [rows] = await pool.query<Polygon[]>(
        'SELECT * FROM Polygons WHERE ST_Distance_Sphere(POINT(centerLng, centerLat), POINT(?, ?)) <= ?',
        [lat, lng, radius],
      );
      return rows as Polygon[];
    } catch (error) {
      console.error(
        `Error fetching polygon with lat ${lat}, lng ${lng}, radius ${radius}:`,
        error,
      );
    }
    return null;
  },
};
