import { Subscription } from '../../../../../Database/entity/subscription.ts';
import { SubEvent } from '../../../../../Database/entity/subEvent.ts';
import type { paths, components } from '../../../../../Types/api.d.ts';
import { RowDataPacket } from 'mysql2';

declare namespace GetSubscriptions {
  type TSubscription = components['schemas']['SubscriptionResponse'] &
    RowDataPacket;

  interface IGetSubscriptionsResponse
    extends paths['/users/{userId}/subscriptions']['get']['responses']['200'][
      'content'
    ]['application/json'] {}

  // Single item in GetSubscriptionsResponse
  type TGetSubscriptionsItem = components['schemas']['SubscriptionResponse'];

  /**
   * Full properties of a subscription
   * Query result from database
   */
  type TFullSubscription = {
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
}
