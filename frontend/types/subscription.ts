export interface Subscription {
    id?: number;
    nickName: string;
    rainDegree: number;
    operator: string;
    createdAt?: string;
    updatedAt?: string;
    isActive: boolean;
    userId: number;
    locationId: number;
  }
  