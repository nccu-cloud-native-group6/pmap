/**
 * Init grid to database's polygons table
 */
import mysql from 'mysql2/promise';
import { featureEach, coordEach, centroid, hexGrid, Units } from '@turf/turf';
import {
  Feature,
  FeatureCollection,
  Polygon,
  Point,
  GeoJsonProperties,
} from 'geojson';
import { hexGridConfig } from '../../constant.js';
import dotenv from 'dotenv';

// ==== Parameters ===

// Grid 涵蓋範圍 (bounding box)
// 資料來源：https://github.com/LuLuSaBee/TW-County-GeoJson/blob/main/twCounty2010.geo.json
const TAIPEI_BOX = hexGridConfig.TAIPEI_BOX as [number, number, number, number];
// lat, lng 的 rounding 小數位數
const ROUNDING_DIGIT = hexGridConfig.ROUNDING_DIGIT;

// Cell size (六邊形大小) 與 cell size 單位
const CELL_SIZE = hexGridConfig.CELL_SIZE;
const UNITS = hexGridConfig.UNITS;

// ===================
export async function initGridToPolygons(): Promise<void> {
  // dotenv.config({path: "../../.env.dev"}); // Check this path for target db
  dotenv.config();

  // Calulate then generate grid
  const box = TAIPEI_BOX;
  const options: {
    units?: Units;
    triangles?: boolean;
    properties?: any;
    mask?: Feature<Polygon>;
  } = {
    units: UNITS as Units,
  };
  const fixedGrid = hexGrid(box, CELL_SIZE, options);
  rounding(fixedGrid, ROUNDING_DIGIT);
  console.log('Polygons length: ', fixedGrid.features.length);

  // Connect to database to save the grid
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true,
  });

  const polygonsData: string[] = [];
  featureEach(fixedGrid, async (feature: Feature<any>, idx: number) => {
    // Make points string
    let points = feature.geometry.coordinates[0].map(
      (coord: [number, number]) => {
        return `${coord[1]} ${coord[0]}`;
      },
    );
    // WKT (Well-Known Text) format
    points = points.join(', ');

    // Calculate center of the polygon
    const center = centroid(feature);
    rounding(center, ROUNDING_DIGIT);
    const centerLat = (center.geometry as Point).coordinates[1];
    const centerLng = (center.geometry as Point).coordinates[0];

    // WGS84 經緯度座標系統
    const polygonData = `(
      ${idx + 1},
      ST_GeomFromText('POLYGON((${points}))', 4326), 
      ${centerLat},
      ${centerLng}
    )`;

    polygonsData.push(polygonData);
  });

  const bulkInsertSql = `
    INSERT INTO Polygons (id, area, centerLat, centerLng)
    VALUES ${polygonsData.join(', ')};`;

  await conn.execute(bulkInsertSql);
  console.log(`Inserted ${polygonsData.length} polygons in bulk.`);

  await conn.end();
  console.log('Done');
}

function rounding(
  grid: FeatureCollection<Polygon, any> | Feature<Point, GeoJsonProperties>,
  digit: number,
): void {
  coordEach(grid, (coord: number[]) => {
    coord[0] = Number(coord[0].toFixed(digit));
    coord[1] = Number(coord[1].toFixed(digit));
  });
}

initGridToPolygons().catch(console.error);
