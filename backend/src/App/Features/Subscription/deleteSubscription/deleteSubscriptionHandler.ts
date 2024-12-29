import { DatabaseError } from '../../../../Errors/errors.js';
import { subscriptionService } from '../../../../Infrastructure/Service/subscriptionService.js';

export const deleteSubscriptionsHandler = {
  handle: async (userId: number, subId: number): Promise<void> => {
    const result = await subscriptionService.deleteSubscription(userId, subId);
    if (!result) {
      throw new DatabaseError();
    }
  },
};
