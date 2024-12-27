import { subscriptionService } from '../../../../Infrastructure/Service/subscriptionService.js';
import { postSubscriptionRes } from './postSubscriptionRes.js';
import { PostSubscription } from './Types/api.js';

export const postSubscriptionHandler = {
  handle: async (
    body: PostSubscription.TPostSubscriptionReqBody,
    userId: number,
  ): Promise<PostSubscription.IPostSubscriptionResponse> => {
    const subId = await subscriptionService.addSubscription(body, userId);
    return postSubscriptionRes.customize(subId);
  },
};
