import * as mysql from 'mysql2/promise';
import { connect } from './common/database';
import { unzipSync } from 'node:zlib';
import {
  Location,
  Report,
  WeatherData,
  WeatherInfo,
} from './entity/process-weather';

export const handler = async (event: any) => {
  if (event.responsePayload === undefined) {
    throw new Error('No requestPayload in the event');
  }

  await main(event.responsePayload);
};

async function main(input: string) {
  const cwaData = await unzipData(input);
  console.log('Unzipped data: ', cwaData.slice(0, 50), '...');

  await parseAndSaveDataToDb(cwaData);
}

export async function unzipData(base64Data: string) {
  const buffer = Buffer.from(base64Data, 'base64');
  const unzipData = unzipSync(buffer);
  return unzipData.toString();
}

async function parseAndSaveDataToDb(data: string) {
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

    const cwaUserId = await findOrCreateCwaUserId(conn);

    const weatherDatas = parse(data);

    // Find all locations id and attach to weatherDatas
    await attachLocationIds(conn, weatherDatas);

    await createCwaReports(conn, cwaUserId, weatherDatas);

    await updateWeatherInfo(conn, weatherDatas);

    console.log('Successfully update weather data');
  } catch (err) {
    console.error('Error: ', err);
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}

function getCoord(data: WeatherData): Location {
  return {
    lat: data.GeoInfo.Coordinates[1].StationLatitude,
    lng: data.GeoInfo.Coordinates[1].StationLongitude,
  };
}

function parse(data: string): WeatherData[] {
  const json = JSON.parse(data);

  const weatherRecords = json.weatherAPI.records.Station;

  const inputWeatherDatas: WeatherData[] = weatherRecords.map((record: any) => {
    return record as WeatherData;
  });
  if (inputWeatherDatas === undefined || inputWeatherDatas.length === 0) {
    throw new Error('Failed to parse data');
  }

  // Combined rainfall API with weather API
  const weatherDatas: WeatherData[] = [];
  const rainRecords = json.rainAPI.records.Station;
  const stationIdToRainFall = new Map<string, any>();

  for (let i = 0; i < rainRecords.length; i++) {
    stationIdToRainFall.set(
      rainRecords[i].StationId,
      rainRecords[i].RainfallElement,
    );
  }

  inputWeatherDatas.forEach((weather) => {
    const rainFallElement = stationIdToRainFall.get(weather.StationId);
    if (rainFallElement === undefined) {
      return;
    }
    weather.RainfallElement = rainFallElement;
    weatherDatas.push(weather);
  });

  console.log('Parsed weatherData, length:', weatherDatas.length);
  return weatherDatas;
}

/**
 * Convert the cwa precipitation to pmap rain degree
 * @param input the precipitation in mm per 10 minutes
 * @returns the rain degree in the range of 0.0 ~ 5.0
 *
 * Ref:
 * - CWA field sepc
 *  - https://opendata.cwa.gov.tw/opendatadoc/Observation/O-A0003-001.pdf
 * - Rainfall degree:
 *  - https://www.cwa.gov.tw/V8/C/P/Rainfall/Rainfall_Hour.html?ID=1
 *  - https://web.tainan.gov.tw/publicdisaster/News_Content.aspx?n=21784&s=7637732
 */
// TODO: How to convert?
export function preciptation10MinToRainDegree(input: number): number {
  // The precipitation past 10 minutes
  const inLb = 0.0; // Input lower bound
  const inUb = 6.7; // Input upper bound

  // The pmap rainDegree range
  const outLb = 0.0;
  const outUb = 5.0;

  // Remap
  let output = ((input - inLb) / (inUb - inLb)) * (outUb - outLb) + outLb;

  // Constraint the output
  output = Math.max(outLb, output);
  output = Math.min(outUb, output);

  return output;
}

async function createCwaReports(
  conn: mysql.Connection,
  userId: number,
  weatherDatas: WeatherData[],
) {
  // For each weather data, creating a report
  const reports: Report[] = [];

  for (const weatherData of weatherDatas) {
    let mappedRainDegree = preciptation10MinToRainDegree(
      weatherData.RainfallElement.Past10Min.Precipitation,
    );
    const comment = `${weatherData.StationName}：${weatherData.WeatherElement.Weather}, 
    10 分鐘雨量：${weatherData.RainfallElement.Past10Min.Precipitation} mm
    1 小時雨量：${weatherData.RainfallElement.Past1hr.Precipitation} mm
    今日累積雨量：${weatherData.WeatherElement.Now.Precipitation} mm
    `;

    // 如果天氣敘述有雨就加一，因為有時候降雨量仍為 0，但天氣敘述有下雨
    if(weatherData.WeatherElement.Weather.includes("雨")){
      mappedRainDegree += 1;
      mappedRainDegree = Math.min(mappedRainDegree, 5.0);
    }

    reports.push({
      rainDegree: mappedRainDegree,
      comment: comment,
      photoUrl: '',
      userId: userId,
      locationId: weatherData.locationId!,
    });
  }

  const values = reports.map((report) => [
    report.rainDegree,
    report.comment,
    report.photoUrl,
    report.userId,
    report.locationId,
  ]);

  const placeholders = values
    .map(() => '(?, ?, ?, ?, ?, UTC_TIMESTAMP())')
    .join(', ');

  const sql = `
    INSERT INTO Reports (rainDegree, comment, photoUrl, userId, locationId, createdAt)
    VALUES ${placeholders}
  `;

  const flatValues = values.flat();

  const [result] = await conn.execute<mysql.ResultSetHeader>(sql, flatValues);

  console.log(`Insert cwa reports, affectedRows: ${result.affectedRows}`);
  return result;
}

async function updateWeatherInfo(
  conn: mysql.Connection,
  weatherDatas: WeatherData[],
) {
  // Update or insert the weather info
  for (const weatherData of weatherDatas) {
    const weatherInfo: WeatherInfo = {
      temperature: weatherData.WeatherElement.AirTemperature,
      rainfall: weatherData.WeatherElement.Now.Precipitation,
      locationId: weatherData.locationId,
    };

    const sql = `SELECT id from WeatherInfo WHERE locationId = ?`;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(sql, [
      weatherInfo.locationId,
    ]);
    if (rows.length === 0) {
      await conn.execute<mysql.ResultSetHeader>(
        'INSERT INTO WeatherInfo (temperature, rainfall, locationId, updatedAt) VALUES (?, ?, ?, UTC_TIMESTAMP())',
        [weatherInfo.temperature, weatherInfo.rainfall, weatherInfo.locationId],
      );
    } else {
      await conn.execute<mysql.ResultSetHeader>(
        'UPDATE WeatherInfo SET temperature = ?, rainfall = ?, updatedAt = UTC_TIMESTAMP() WHERE id = ?',
        [weatherInfo.temperature, weatherInfo.rainfall, rows[0].id],
      );
    }
  }
}

/**
 * Given an array of locations, find the locationId of each location
 * If locations not exist, create a new location in the database
 */
async function attachLocationIds(
  conn: mysql.Connection,
  weatherDatas: WeatherData[],
) {
  for (let i = 0; i < weatherDatas.length; i++) {
    const location = getCoord(weatherDatas[i]);
    const [rows, _] = await conn.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM Locations WHERE lat = ? AND lng = ?',
      [location.lat, location.lng],
    );

    if (rows.length === 0) {
      // Find the ploygonId
      const polygonId = await findNearestPolygonId(
        conn,
        location.lat,
        location.lng,
      );

      const [results] = await conn.execute<mysql.ResultSetHeader>(
        'INSERT INTO Locations (lat, lng, address, polygonId, createdAt) VALUES (?, ?, ?, ?, UTC_TIMESTAMP())',
        [location.lat, location.lng, weatherDatas[i].address, polygonId],
      );
      weatherDatas[i].locationId = results.insertId;
    } else {
      weatherDatas[i].locationId = rows[0].id;
    }
  }
}

async function findOrCreateCwaUserId(conn: mysql.Connection): Promise<number> {
  const [rows] = await conn.execute<mysql.RowDataPacket[]>(
    'SELECT * FROM Users WHERE name = "cwa"',
  );

  if (rows.length === 0) {
    const [result] = await conn.execute<mysql.ResultSetHeader>(
      'INSERT INTO Users (name, email, password, provider) VALUES (?, ?, ?, ?)',
      [
        'cwa',
        process.env.CWA_PMAP_EMAIL,
        process.env.CWA_PMAP_PASSWORD,
        'native',
      ],
    );
    return result.insertId;
  }
  return rows[0].id;
}

async function findNearestPolygonId(
  conn: mysql.Connection,
  lat: number,
  lng: number,
) {
  const sql = `
      SELECT id
      FROM Polygons
      ORDER BY ST_Distance_Sphere(
        POINT(${lng}, ${lat}),
        POINT(centerLng, centerLat)
      )
      LIMIT 1;`;

  const [rows] = await conn.execute<mysql.RowDataPacket[]>(sql);
  return rows[0].id;
}
