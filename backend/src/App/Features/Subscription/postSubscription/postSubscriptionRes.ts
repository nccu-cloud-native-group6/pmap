import { PostSubscription } from './Types/api.js';

export const postSubscriptionRes = {
  customize: async (
    newSubscriptionId: number,
  ): Promise<PostSubscription.IPostSubscriptionResponse> => {
    return {
      data: {
        newSubscriptionId: newSubscriptionId,
      },
    };
  },
};
