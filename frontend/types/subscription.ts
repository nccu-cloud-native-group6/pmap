export interface Subscription {
  id: number;
  nickName: string;
  rainDegree: number;
  operator: string;
  isActive: boolean;
  locationId: number;
  userId: number;
  eventType: "fixedTimeSummary" | "anyTimeReport" | "periodReport";
  createdAt: Date;
  updatedAt: Date;
}
