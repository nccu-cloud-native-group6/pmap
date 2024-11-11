// src/entities/Subscription.ts

export interface Subscription {
  id?: number;
  nickName?: string;
  rainDegree?: number;
  operator?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  userId?: number;
  locationId?: number;
}
