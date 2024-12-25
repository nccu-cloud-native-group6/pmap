import { subscriptionService } from '../../../../Infrastructure/Service/subscriptionService.js';
import { getSubscriptionRes } from './getSubscriptionRes.js';
import { GetSubscriptions } from './Types/api.js';

export const getSubscriptionsHandler = {
  handle: async (
    userId: number,
  ): Promise<GetSubscriptions.IGetSubscriptionsResponse> => {
    const subs = await subscriptionService.getSubscriptions(userId);
    return getSubscriptionRes.customize(subs);
  },
};
