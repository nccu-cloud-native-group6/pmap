import * as cron from 'node-cron';
import { PostSubscription } from '../../App/Features/Subscription/postSubscription/Types/api.js';
import { redis } from '../../Database/redis.js';
import { testPub } from '../../Database/messageQueue.js';

export const notificationService = {
  // TODO:NOTIF
  // plz feel free to do whatever you want, like rewrite whole file

  // Do somthing to redis, add sub info, time range...
  async onNewSubscription(
    subId: Number,
    newSub: PostSubscription.INewSubscription,
  ): Promise<void> {
    const key = `sub:${subId}`;

    // With ioredis, we can use hmset to set multiple hash fields at once
    await redis.hmset(key, {
      userId: newSub.userId!,
      subId: newSub.userId!,
      polygonIds: newSub.polygonIds.toString(),
    });
  },
  startSchedler() {
    // TODO: do something regularly
    // For example, run every 1 minutes
    cron.schedule('*/1 * * * *', async () => {
      console.log('Trigger notification service scheduled task');

      // Testing: testing mqtt pub
      await testPub();
    });
  },
};
