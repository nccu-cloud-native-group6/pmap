/**
 * Retreive the grid data from the database to a GeoJSON file.
 * The grid_output.json can be put into github's gist for visualization.
 * Run:
 *  // Check .env.test containing the target database info
 *  node src/Database/migrate/polygons/test_grid_output.ts
 */
import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: 'src/.env.test' });

// 定義資料庫回傳的資料型別
interface Polygon {
  id: number;
  avgRainDegree: number;
  geojson_area: string;
  centerLat: number;
  centerLng: number;
}

// 定義 GeoJSON 格式
interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    id: number;
    avgRainDegree: number;
    centerLat: number;
    centerLng: number;
  };
  geometry: string;
}

interface GeoJSON {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

(async () => {
  try {
    // 建立資料庫連線
    const conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      multipleStatements: true,
    });
    console.log(`Host: ${process.env.MYSQL_HOST}`);

    console.log('Connected to the database.');

    // 從資料庫撈取資料
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(`
      SELECT 
        id, 
        avgRainDegree, 
        ST_AsGeoJSON(area) AS geojson_area, 
        centerLat, 
        centerLng 
      FROM Polygons;
    `);

    // 準備 GeoJSON 格式
    const geojson: GeoJSON = {
      type: 'FeatureCollection',
      features: rows.map((row) => ({
        type: 'Feature',
        properties: {
          id: row.id,
          avgRainDegree: row.avgRainDegree,
          centerLat: row.centerLat,
          centerLng: row.centerLng,
        },
        geometry: row.geojson_area, // 將 GeoJSON 資料解析為物件
      })),
    };

    // 將 GeoJSON 寫入檔案
    fs.writeFileSync(
      'src/Database/migrate/polygons/grid_output.json',
      JSON.stringify(geojson, null, 2),
    );
    console.log('GeoJSON has been written to grid_output.json');

    // 關閉連線
    await conn.end();
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();
