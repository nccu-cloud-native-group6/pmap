import * as mysql from 'mysql2/promise';
import * as turf from '@turf/turf';
import { connect } from './common/database';

// The reports are used to compute the weather should be created within the validMins
const VALID_MINS = 15;

// The input report
interface Report {
  id?: number;
  rainDegree: number;
  lat: number;
  lng: number;
  createdAt?: Date;
}

interface Polygon {
  id: number;
  avgRainDegree?: number | null;
  centerLat: number;
  centerLng: number;
  area: GeoJSON.Polygon;
}

export const handler = async () => {
  await main();
};

async function main() {
  let conn;

  try {
    conn = await connect(
      process.env.MYSQL_HOST!,
      parseInt(process.env.MYSQL_PORT!),
      process.env.AWS_REGION!,
      process.env.MYSQL_DATABASE!,
      process.env.MYSQL_USER!,
      process.env.MYSQL_PASSWORD || '',
    );

    // Featch reports within the validMins to compute the weather
    const reports = await fetchReports(conn, VALID_MINS);
    if (reports.length === 0) {
      console.log('No valid input reports found');
      return;
    }
    let validInputSize = reports.length;
    console.log('Valid input report size:', validInputSize);

    // Compute
    let polygons = await fetchPolygons(conn);
    polygons = computeWeather(reports, polygons);

    // Update back to the database
    const result = await updatePolygons(conn, polygons);
    await conn.end();

    console.log('Successfully computed, info:', result.info);
  } catch (err) {
    console.error('Error: ', err);
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}

async function fetchPolygons(conn: mysql.Connection): Promise<Polygon[]> {
  const [rows] = await conn.execute<mysql.RowDataPacket[]>(
    'SELECT id, avgRainDegree, centerLat, centerLng FROM Polygons',
  );
  return rows as Polygon[];
}

/**
 * Compute the weather data using IWD
 * Modified from turf.interpolate()
 */
function computeWeather(reports: Report[], polygons: Polygon[]): Polygon[] {
  // Compute using IWD
  let weight = 1; // The power of the distance
  let options: {
    units?: turf.Units;
  } = { units: 'kilometers' };

  polygons.forEach((polygon) => {
    let sw = 0; // sum of weight
    let zw = 0; // weighted z value
    reports.forEach((report) => {
      let point = turf.point([report.lng, report.lat]);
      let gridPoint = turf.point([polygon.centerLng, polygon.centerLat]);
      let d = turf.distance(gridPoint, point, options);
      let zValue = Number(report.rainDegree);
      // Btw the original turf.interpolate() seem to be wrong when d = 0
      if (d === 0) {
        console.log('IWD encountered d = 0');
        sw = 1.0;
        zw = zValue;
        return;
      }
      let w = 1.0 / Math.pow(d, weight);
      sw += w;
      zw += w * zValue;
    });
    polygon.avgRainDegree = zw / sw;
  });
  return polygons;
}

async function updatePolygons(
  conn: mysql.Connection,
  polygons: Polygon[],
): Promise<mysql.ResultSetHeader> {
  const caseStatements = polygons
    .map((polygon) => `WHEN ${polygon.id} THEN ${polygon.avgRainDegree}`)
    .join('\n');

  const sql = `
    UPDATE Polygons 
    SET avgRainDegree = CASE ID 
      ${caseStatements}
    END
    WHERE ID IN (${polygons.map((p) => p.id).join(',')});
  `;

  const [result] = await conn.execute<mysql.ResultSetHeader>(sql);
  return result;
}

/**
 * Fetch valid reports that can be the input data
 * @param validMins: reports should be created within the validMins
 * @returns Reports
 */
async function fetchReports(
  conn: mysql.Connection,
  validMins: number,
): Promise<Report[]> {
  const sql = `
  SELECT lat, lng, rainDegree, R.createdAt
  FROM Reports AS R JOIN Locations AS L
  ON R.locationId = L.id
  WHERE ABS(TIMESTAMPDIFF(MINUTE, R.createdAt, NOW())) <= ${validMins};`;

  const [rows] = await conn.execute<mysql.RowDataPacket[]>(sql);
  return rows.map((row) => ({
    lat: row.lat,
    lng: row.lng,
    rainDegree: row.rainDegree,
    createdAt: row.createdAt, // 時間許可的話可以再根據距離時間算權重
  })) as Report[];
}
