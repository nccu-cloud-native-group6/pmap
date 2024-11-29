// src/entities/Location.ts

export interface Location {
  id?: number;
  lat: number;
  lng: number;
  address?: string;
  createdAt?: Date;
  polygonId?: number;
}
