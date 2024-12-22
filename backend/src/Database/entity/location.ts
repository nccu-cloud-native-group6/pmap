// src/entities/Location.ts
import { RowDataPacket } from 'mysql2/promise';
export interface Location extends RowDataPacket {
  id: number;
  lat: number;
  lng: number;
  address?: string;
  createdAt?: Date;
  polygonId?: number;
}
