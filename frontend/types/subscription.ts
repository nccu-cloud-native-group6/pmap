import { Location } from "./location";

export interface Subscription {
  id: number;
  nickName: string;
  rainDegree: number;
  operator: string;
  isActive: boolean;
  locationId: string[];
  conditions: {
    id: number;
    operator: ">" | "<";
    value: number;
  }[];
  location: Location;
  userId: number;
  eventType: "fixedTimeSummary" | "anyTimeReport" | "periodReport";
  until: Date | null;
  recurrence: "none" | "daily" | "weekly" | "monthly";
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt?: Date;
}
