// src/entities/SubEvent.ts
import { RowDataPacket } from 'mysql2/promise';
export type EventType = 'fixedTimeSummary' | 'anyTimeReport' | 'periodReport';

export interface SubEvent extends RowDataPacket {
  id?: number;
  eventType: EventType;
  startTime?: string; // Alternatively, use Date if time handling is preferred
  startDate?: Date;
  endTime?: string; // Alternatively, use Date if time handling is preferred
  recurrence: string;
  lastNotifiedAt?: Date;
  isActive?: boolean;
  subscriptionId?: number;
}
