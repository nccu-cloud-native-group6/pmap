import { subscriptionService } from '../../../../Infrastructure/Service/subscriptionService.js';
import { getSubscriptionsRes } from './getSubscriptionsRes.js';
import { GetSubscriptions } from './Types/api.js';

export const getSubscriptionsHandler = {
  handle: async (
    userId: number,
  ): Promise<GetSubscriptions.IGetSubscriptionsResponse> => {
    const subs = await subscriptionService.getSubscriptions(userId);
    return getSubscriptionsRes.customize(subs);
  },
};
