// src/entities/subPolygon.ts
import { RowDataPacket } from 'mysql2/promise';
export interface SubPolygon extends RowDataPacket {
  subscriptionId?: number;
  polygonId?: number;
}
