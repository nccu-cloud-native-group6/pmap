// src/entities/Subscription.ts
import { RowDataPacket } from 'mysql2/promise';
export interface Subscription extends RowDataPacket {
  id?: number;
  nickName?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  userId?: number;
  locationId?: number;
}
