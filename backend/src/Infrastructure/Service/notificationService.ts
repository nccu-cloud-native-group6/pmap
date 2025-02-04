import * as cron from 'node-cron';
import { PostSubscription } from '../../App/Features/Subscription/postSubscription/Types/api.js';
import { redis } from '../../Database/redis.js';
import { sendToNotificationServer } from '../../Database/messageQueue.js';
import { Polygon } from '../../Database/entity/polygon.js';
import { polygonRepo } from '../Repository/polygonRepo.js';
import logger from '../../Logger/index.js';

const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export const notificationService = {
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
    email: string,
    nickname: string,
  ): Promise<void> {
    // process param to redis format
    const key = `id:${subId}-` + crypto.randomUUID();
    let rType = 'report';
    if (type === 'fixedTimeSummary') {
      rType = 'weather';
    }
    let rStartTime = startDate.getHours() * 3600 + startDate.getMinutes() * 60;
    let rEndTime = endDate
      ? endDate.getHours() * 3600 + endDate.getMinutes() * 60
      : 86400;
    let rCondition = '0,1,2,3,4,5';
    if (condition !== null && condition.operator === 'gte') {
      rCondition = condition.value.toString();
      condition.value = Number(condition.value);
      console.log('RCondition: ', rCondition);
      console.log('Condition.value: ', condition.value);
      console.log('typeof ondition.value: ', typeof condition.value);
      for (let i = condition.value + 1; i <= 5; i++) {
        rCondition += ',' + i;
        console.log(`gte rCondition in for: ${rCondition}`);
      }
    } else if (condition !== null && condition.operator === 'lte') {
      condition.value = Number(condition.value);
      rCondition = '0';
      for (let i = 1; i <= condition.value; i++) {
        rCondition += ',' + i;
        console.log(`lte rCondition in for: ${rCondition}`);
      }
    }
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
      endDate: endDate ? endDate.getTime() : Number.MAX_SAFE_INTEGER - 1,
      startTime: rStartTime,
      endTime: rEndTime,
      polygonIds: polygonIds.join(','),
      condition: rCondition,
      until: until ? until.getTime() : Number.MAX_SAFE_INTEGER - 1,
      recurrence: rRcurrence,
      email: email,
      nickname: nickname,
    });
    console.log('subEvent inserted to redis');
  },
  startSchedler() {
    // TODO: do something regularly
    // For example, run every 1 minutes
    cron.schedule('*/1 * * * *', async () => {
      // cron.schedule('*/10 * * * * *', async () => {
      console.log('Trigger notification service scheduled task');
      // get all polygons from db
      let now = new Date().getHours() * 3600 + new Date().getMinutes() * 60;
      // console.log('now:', now);
      let avgRainDegreeData = (await polygonRepo.getAllPolygons()) || [];
      // console.log('avgRainDegreeData:', avgRainDegreeData);
      // get all match subscriptions from redis
      let timeMatchSubs: any = await redis.call(
        'FT.SEARCH',
        'idx:subscription',
        '@type:{weather}',
        'FILTER',
        'startTime',
        `${now}`,
        `${now}`,
      );
      // console.log("timeMatchSubs:", timeMatchSubs);
      let fixedTimeSummaryNotifications: any[] = [];
      (timeMatchSubs as any[]).forEach(async (sub: any) => {
        if (Array.isArray(sub)) {
          // handle each time match sub
          let notification: {
            userId: String;
            email: String;
            subId: String;
            nickname: String;
            rainDegree?: any[];
          } = {
            userId: sub[sub.indexOf('userId') + 1],
            email: sub[sub.indexOf('email') + 1],
            subId: sub[sub.indexOf('subId') + 1],
            nickname: sub[sub.indexOf('nickname') + 1],
          };
          let rainDegree: any[] = [];
          const polygonIds = sub[sub.indexOf('polygonIds') + 1];
          polygonIds.split(',').forEach(async (polygonId: string) => {
            // insert rain degree by polygonId
            let polygonIndex = Number(polygonId) - 1;
            rainDegree.push(avgRainDegreeData[polygonIndex]);
          });
          notification['rainDegree'] = rainDegree;
          // console.log('notification:', notification);
          fixedTimeSummaryNotifications.push(notification);
        }
      });
      sendToNotificationServer(JSON.stringify(fixedTimeSummaryNotifications));
      // console.log('fixedTimeSummaryNotifications:', fixedTimeSummaryNotifications);
    });
    // delete expired subscriptions
    cron.schedule('0 0 * * *', async () => {
      const expiredSub = await redis.call(
        'FT.SEARCH',
        'idx:subscription',
        '*',
        'FILTER',
        'until',
        `0`,
        `${new Date().getTime()}`,
      );
      console.log('expiredSub: ', expiredSub);
      const documentIds = (expiredSub as any[])
        .slice(1)
        .filter((_, i) => i % 2 === 0);

      if (documentIds.length !== 0) {
        const pipeline = redis.pipeline();
        documentIds.forEach((id) => pipeline.del(id));
        await pipeline.exec();
      }
    });
  },
  async onNewReport(
    polygonId: Number,
    rainDegree: Number,
    newReportId: Number,
  ): Promise<void> {
    // get all match subscriptions from redis
    let now = new Date().getTime();
    let nowTime = new Date().getHours() * 3600 + new Date().getMinutes() * 60;
    let today = new Date().getDay();
    let todate = new Date().getDate();
    // console.log('now:', now);
    // console.log('nowTime:', nowTime);
    // console.log('today:', weekdays[today]);
    // console.log('todate:', todate);
    let matchRecurrenceSubs: any = await redis.call(
      'FT.SEARCH',
      'idx:subscription',
      `@polygonIds:{${polygonId}}` +
        '@type:{report}' +
        `@condition:{${rainDegree}}` +
        `@recurrence:{${weekdays[today]}|${todate}}`,
      'FILTER',
      'startTime',
      `-inf`,
      `${nowTime}`,
      'FILTER',
      'endTime',
      `${nowTime}`,
      `+inf`,
    );
    // console.log("matchSubs:", matchRecurrenceSubs);
    let matchNonRecurrenceSubs: any = await redis.call(
      'FT.SEARCH',
      'idx:subscription',
      `@polygonIds:{${polygonId}}` +
        '@type:{report}' +
        `@condition:{${rainDegree}}` +
        `@recurrence:{none}`,
      'FILTER',
      'startDate',
      `-inf`,
      `${now}`,
      'FILTER',
      'endDate',
      `${now}`,
      `+inf`,
    );
    // console.log("matchSubs:", matchNonRecurrenceSubs);
    let reportNotifications: any[] = [];
    (matchRecurrenceSubs as any[]).forEach(async (sub: any) => {
      if (Array.isArray(sub)) {
        // handle each time match sub
        let notification: {
          userId: String;
          email: String;
          subId: String;
          nickname: String;
          reportId: String;
          polygonId: String;
          rainDegree: Number;
        } = {
          userId: sub[sub.indexOf('userId') + 1],
          email: sub[sub.indexOf('email') + 1],
          subId: sub[sub.indexOf('subId') + 1],
          nickname: sub[sub.indexOf('nickname') + 1],
          reportId: newReportId.toString(),
          polygonId: polygonId.toString(),
          rainDegree: rainDegree,
        };
        reportNotifications.push(notification);
      }
    });
    (matchNonRecurrenceSubs as any[]).forEach(async (sub: any) => {
      if (Array.isArray(sub)) {
        // handle each time match sub
        let notification: {
          userId: String;
          email: String;
          subId: String;
          nickname: String;
          reportId: String;
          polygonId: String;
          rainDegree: Number;
        } = {
          userId: sub[sub.indexOf('userId') + 1],
          email: sub[sub.indexOf('email') + 1],
          subId: sub[sub.indexOf('subId') + 1],
          nickname: sub[sub.indexOf('nickname') + 1],
          reportId: newReportId.toString(),
          polygonId: polygonId.toString(),
          rainDegree: rainDegree,
        };
        reportNotifications.push(notification);
      }
    });
    // console.log('reportNotifications:', reportNotifications);
    sendToNotificationServer(JSON.stringify(reportNotifications));
  },
  async onUnSubscribe(subId: Number): Promise<void> {
    // delete from redis
    const selectedSub = await redis.call(
      'FT.SEARCH',
      'idx:subscription',
      `@subId:${subId}`,
    );
    console.log('selectedSub: ', selectedSub);
    const documentIds = (selectedSub as any[])
      .slice(1)
      .filter((_, i) => i % 2 === 0);

    if (documentIds.length !== 0) {
      const pipeline = redis.pipeline();
      documentIds.forEach((id) => pipeline.del(id));
      await pipeline.exec();
    }
  },
};
