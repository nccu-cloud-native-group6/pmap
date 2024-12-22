// src/entities/Report.ts

import { RowDataPacket } from 'mysql2/promise';

export interface Report extends RowDataPacket {
  id: number;
  rainDegree: number;
  comment?: string;
  photoUrl?: string;
  userId?: number;
  locationId?: number;
  createdAt?: Date;
}
