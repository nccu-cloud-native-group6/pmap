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
}
