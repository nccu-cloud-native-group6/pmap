import * as cron from 'node-cron';
import { PostSubscription } from '../../App/Features/Subscription/postSubscription/Types/api.js';
import { redis } from '../../Database/redis.js';
import { testPub } from '../../Database/messageQueue.js';

export const notificationService = {
  // TODO:NOTIF
  // plz feel free to do whatever you want, like rewrite whole file

  // Do somthing to redis, add sub info, time range...
  async onNewSubEvent(
    subId: Number,
    userId: Number,
    type: string,
    startDate: Date,
    endDate: Date | null,
    polygonIds: Number[],
    condition: { value: number; operator: string } | null,
    until: Date | null,
    recurrence: string | null,
  ): Promise<void> {
    console.log("I'm fucking in onNewSubEvent");
    // process param to redis format
    const key = `id:${subId}`;
    let rType = 'report';
    if (type === 'fixedTimeSummary') {
      rType = 'report';
    }
    let rStartTime =
      startDate.getHours() * 3600 +
      startDate.getMinutes() * 60 +
      startDate.getSeconds();
    let rEndTime = endDate
      ? endDate.getHours() * 3600 +
        endDate.getMinutes() * 60 +
        endDate.getSeconds()
      : -1;
    let rCondition = '0,1,2,3,4,5';
    if (condition !== null && condition.operator === 'gte') {
      rCondition = condition.value.toString();
      for (let i = condition.value + 1; i <= 5; i++) {
        rCondition += ',' + i;
      }
    } else if (condition !== null && condition.operator === 'lte') {
      rCondition = '0';
      for (let i = 1; i <= condition.value; i++) {
        rCondition += ',' + i;
      }
    }
    const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    let rRcurrence = 'none';
    if (recurrence !== null) {
      if (recurrence === 'RRULE:FREQ=DAILY') {
        rRcurrence = 'mon,tue,wed,thu,fri,sat,sun';
      } else if (recurrence === 'RRULE:FREQ=WEEKLY') {
        rRcurrence = weekdays[startDate.getDay()];
      } else if (recurrence === 'RRULE:FREQ=MONTHLY') {
        rRcurrence = startDate.getDate().toString();
      }
    }
    // insert to redis
    await redis.hset(key, {
      subId: subId,
      userId: userId,
      type: rType,
      startDate: startDate.getTime(),
      endDate: endDate ? endDate.getTime() : -1,
      startTime: rStartTime,
      endTime: rEndTime,
      polygonIds: polygonIds.join(','),
      condition: rCondition,
      until: until ? until.getTime() : null,
      recurrence: rRcurrence,
    });

    console.log('subEvent inserted to redis');
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
