import { Subscription } from '../../../../../Database/entity/subscription.ts';
import { SubEvent } from '../../../../../Database/entity/subEvent.ts';
import type { paths, components } from '../../../../../Types/api.d.ts';

declare namespace PostSubscription {
  type TPostSubscriptionReqBody =
    paths['/users/{userId}/subscriptions']['post']['requestBody']['content']['application/json'];

  type TPostSubscriptionSubEvent = components['schemas']['SubEvent'];

  interface INewSubEvent
    extends Pick<
      SubEvent,
      | 'eventType'
      | 'recurrence'
      | 'startDate'
      | 'startTime'
      | 'endTime'
      | 'operator'
      | 'rainDegree'
      | 'until'
      | 'isActive'
    > {}

  interface INewSubscription
    extends Pick<
      Subscription,
      'nickName' | 'userId' | 'locationId' | 'isActive'
    > {
    subEvents: INewSubEvent[];
    polygonIds: number[];
  }

  interface IPostSubscriptionResponse {
    data: paths['/users/{userId}/subscriptions']['post']['responses']['201']['content']['application/json'];
  }
}
