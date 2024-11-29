// src/entities/Polygon.ts

export interface Polygon {
  id?: number;
  avgRainDegree?: number;
  centerLat: number;
  centerLng: number;
  area: GeoJSON.Polygon;
}
