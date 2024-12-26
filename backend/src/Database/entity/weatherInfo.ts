// src/entities/WeatherInfo.ts
import { RowDataPacket } from 'mysql2/promise';
export interface WeatherInfo extends RowDataPacket {
  id?: number;
  temperature?: number;
  rainfall?: number;
  locationId?: number;
  updatedAt?: Date;
}
