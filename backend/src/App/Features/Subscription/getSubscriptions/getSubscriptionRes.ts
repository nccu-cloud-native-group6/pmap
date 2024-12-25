import { GetSubscriptions } from './Types/api.js';

export const getSubscriptionRes = {
  customize: async (
    subs: GetSubscriptions.TFullSubscription[],
  ): Promise<GetSubscriptions.IGetSubscriptionsResponse> => {
    return subs.map(
      (sub) =>
        ({
          location: sub.location,
          selectedPolygonsIds: sub.selectedPolygonIds.split(',').map(Number)!,
          nickName: sub.nickName!,
          subEvents: sub.subEvents.map((event) => {
            return {
              time: {
                type: event.time.type,
                startTime: combinedDateAndTime(
                  event.time.startDate,
                  event.time.startTime,
                ),
                endTime: event.time.endTime,
                recurrence: event.time.recurrence,
                until: event.time.until,
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
        }) as GetSubscriptions.TGetSubscriptionsItem,
    );
  },
};

function combinedDateAndTime(date: string, time: string): string {
  const dt = new Date(`${date.split(' ')[0]}T${time}`);
  return dt.toISOString();
}
