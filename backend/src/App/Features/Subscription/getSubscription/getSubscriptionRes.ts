import { TFullSubscription } from '../../../../Database/entity/subscription.js';
import {
  combinedDateAndTime,
  timestampToIsoDate,
} from '../../../../utils/formatter.js';
import { GetSubscription } from './Types/api.js';

export const getSubscriptionRes = {
  customize: async (
    sub: TFullSubscription,
  ): Promise<GetSubscription.IGetSubscriptionResponse> => {
    return {
      location: sub.location,
      selectedPolygonsIds: sub.selectedPolygonIds.split(',').map(Number)!,
      nickName: sub.nickName!,
      subEvents: sub.subEvents.map((event) => {
        const endTime = event.time.endTime
          ? combinedDateAndTime(event.time.startDate, event.time.endTime)
          : null;
        return {
          time: {
            type: event.time.type,
            startTime: combinedDateAndTime(
              event.time.startDate,
              event.time.startTime,
            ),
            endTime: endTime,
            recurrence: event.time.recurrence,
            until: timestampToIsoDate(event.time.until),
          },
          rain: {
            operator: event.rain.operator,
            value: event.rain.value,
          },
          isActive: event.isActive ? true : false,
        };
      }),
      createdAt: sub.createdAt!,
      id: sub.id,
    };
  },
};