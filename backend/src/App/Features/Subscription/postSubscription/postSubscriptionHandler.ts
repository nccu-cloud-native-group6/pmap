import { subscriptionService } from '../../../../Infrastructure/Service/subscriptionService.js';
import { postSubscriptionRes } from './postSubscriptionRes.js';
import { PostSubscription } from './Types/api.js';

export const postSubscriptionHandler = {
  handle: async (
    body: PostSubscription.TPostSubscriptionReqBody,
    userId: number,
  ): Promise<PostSubscription.IPostSubscriptionResponse> => {
    // Validate and clean the data
    postSubscriptionHandler.cleanAndValidate(body);

    const subId = await subscriptionService.addSubscription(body, userId);

    return postSubscriptionRes.customize(subId);
  },
  cleanAndValidate: (body: PostSubscription.TPostSubscriptionReqBody): void => {
    // Clean duplicate subId
    body.selectedPolygonsIds = Array.from(new Set(body.selectedPolygonsIds));

    if (body.selectedPolygonsIds.length === 0) {
      throw new Error('selectedPolygonsIds should not be empty');
    }
  },
};
