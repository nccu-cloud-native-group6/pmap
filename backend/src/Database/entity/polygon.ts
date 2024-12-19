// src/entities/Polygon.ts

import { RowDataPacket } from 'mysql2';

export interface Polygon extends RowDataPacket {
  id?: number;
  avgRainDegree?: number;
  centerLat: number;
  centerLng: number;
  area: GeoJSON.Polygon;
}
