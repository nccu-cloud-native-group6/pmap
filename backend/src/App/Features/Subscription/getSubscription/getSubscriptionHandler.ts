import { ResourceNotFoundError } from '../../../../Errors/errors.js';
import { subscriptionService } from '../../../../Infrastructure/Service/subscriptionService.js';
import { getSubscriptionRes } from './getSubscriptionRes.js';
import { GetSubscription } from './Types/api.js';

export const getSubscriptionHandler = {
  handle: async (
    userId: number,
    subId: number,
  ): Promise<GetSubscription.IGetSubscriptionResponse> => {
    const result = await subscriptionService.getSubscription(userId, subId);

    if (!result) {
      throw new ResourceNotFoundError();
    }
    return await getSubscriptionRes.customize(result);
  },
};
