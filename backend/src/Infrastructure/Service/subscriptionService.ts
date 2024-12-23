import { PostSubscription } from '../../App/Features/Subscription/postSubscription/Types/api.js';
import pool from '../../Database/database.js';
import { InvalidInputError } from '../../Errors/errors.js';
import logger from '../../Logger/index.js';
import { locationRepo } from '../Repository/locationRepo.js';
import { subscriptionRepo } from '../Repository/subscriptionRepo.js';
import { userRepo } from '../Repository/userRepo.js';

export const subscriptionService = {
  addSubscription: async (
    body: PostSubscription.TPostSubscriptionReqBody,
    userId: number,
  ): Promise<number> => {
    if ((await userRepo.findById(userId)) === null) {
      throw new InvalidInputError(`Cannot find user with userId=${userId}`);
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      body;
      const location = await locationRepo.findByAddressAndLngAndLat(
        body.location.address,
        body.location.latlng.lng,
        body.location.latlng.lat,
      );

      let locationId = location?.id;
      if (locationId === undefined) {
        locationId = await locationRepo.create(body.location, connection);
      }

      // Convert the subEvents from the request body to the format that the database expects
      const subEvents: PostSubscription.INewSubEvent[] = body.subEvents.map(
        (subEvent) => {
          console.log('before', subEvent);
          return {
            eventType: subEvent.time.type,
            recurrence: subEvent.time.recurrence,
            startDate: new Date(subEvent.time.startTime), // Start date is from the startTime
            until: subEvent.time.until ? new Date(subEvent.time.until) : null,
            startTime: subEvent.time.startTime,
            endTime: subEvent.time.endTime,
            operator: subEvent.rain?.operator ?? null,
            rainDegree: subEvent.rain?.value ?? null,
            isActive: subEvent.isActive ?? true,
          } as PostSubscription.INewSubEvent;
        },
      );

      console.log('after', subEvents);

      const newSubscription: PostSubscription.INewSubscription = {
        nickName: body.nickName,
        userId: userId,
        locationId: locationId,
        polygonIds: body.selectedPolygonsIds,
        subEvents: subEvents,
        isActive: true, // By default, the whole subscription is active
      };

      // Insert the new subscription
      const subId = await subscriptionRepo.createSubscription(
        newSubscription,
        connection,
      );

      await subscriptionRepo.createSubPolygons(
        newSubscription.polygonIds,
        subId,
        connection,
      );

      await subscriptionRepo.createSubEvents(
        newSubscription.subEvents,
        subId,
        connection,
      );

      await connection.commit();
      return subId;
    } catch (error) {
      await connection.rollback();
      logger.error(error, 'Error in addSubscription');
      throw error;
    }
  },
};
