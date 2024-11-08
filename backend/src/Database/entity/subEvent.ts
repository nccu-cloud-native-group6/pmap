// src/entities/SubEvent.ts

export type EventType = 'fixedTimeSummary' | 'anyTimeReport' | 'periodReport';

export interface SubEvent {
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
