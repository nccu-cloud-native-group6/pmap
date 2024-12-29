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

/**
 * Full properties of a subscription
 * Query result from database
 */
export type TFullSubscription = {
  id: number;
  nickName?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  userId: number;
  locationId: number;
  location: {
    latlng: {
      lat: number;
      lng: number;
    };
    address: string;
  };
  selectedPolygonIds: string;
  subEvents: {
    time: {
      type: 'fixedTimeSummary' | 'anyTimeReport' | 'periodReport';
      startTime: string;
      startDate: string;
      endTime?: string | null;
      recurrence?: string | null;
      until?: string | null;
    };
    rain: {
      operator?: 'gte' | 'lte' | 'eq' | null;
      value?: number | null;
    };
    isActive: boolean;
  }[];
} & RowDataPacket;
