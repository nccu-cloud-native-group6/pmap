import { RowDataPacket } from 'mysql2';
import type { paths, components } from '../../../../../Types/api.d.ts';

declare namespace GetSubscription {
  const _uri = '/users/{userId}/subscriptions/{id}';

  interface IGetSubscriptionResponse
    extends paths[_uri]['get']['responses']['200']['content'][
      'application/json'
    ] {}
}
