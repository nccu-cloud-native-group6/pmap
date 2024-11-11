// src/entities/Report.ts

export interface Report {
  id?: number;
  rainDegree: number;
  comment?: string;
  photoUrl?: string;
  userId?: number;
  locationId?: number;
  createdAt?: Date;
}
