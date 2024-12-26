import { GetSubscription } from '../../App/Features/Subscription/getSubscription/Types/api.js';
import { GetSubscriptions } from '../../App/Features/Subscription/getSubscriptions/Types/api.js';
import { PostSubscription } from '../../App/Features/Subscription/postSubscription/Types/api.js';
import pool from '../../Database/database.js';
import {
  Subscription,
  TFullSubscription,
} from '../../Database/entity/subscription.js';
import { InvalidInputError } from '../../Errors/errors.js';
import logger from '../../Logger/index.js';
import { locationRepo } from '../Repository/locationRepo.js';
import { polygonRepo } from '../Repository/polygonRepo.js';
import { subscriptionRepo } from '../Repository/subscriptionRepo.js';
import { userRepo } from '../Repository/userRepo.js';
import { notificationService } from './notificationService.js';
import { User } from '../../Database/entity/user.js';

async function checkUserExist(userId: number) {
  if ((await userRepo.findById(userId)) === null) {
    throw new InvalidInputError(`Cannot find user with userId=${userId}`);
  }
}

export const subscriptionService = {
  addSubscription: async (
    body: PostSubscription.TPostSubscriptionReqBody,
    userId: number,
  ): Promise<number> => {
    await checkUserExist(userId);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const location = await locationRepo.findByAddressAndLngAndLat(
        body.location.address,
        body.location.latlng.lng,
        body.location.latlng.lat,
      );

      let locationId = location?.id;
      if (locationId === undefined) {
        const polygonId = await polygonRepo.findNearestPolygonId(
          body.location.latlng.lat,
          body.location.latlng.lng,
        );

        if (polygonId === null) {
          logger.error('Cannot find the nearest polygon by given latlng.');
          throw new InvalidInputError('Unknown location');
        }

        locationId = await locationRepo.create(
          {
            ...body.location,
            polygonId,
          },
          connection,
        );
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

      const email = ((await userRepo.findById(userId)) as User).email;

      // Handle notification related logic
      body.subEvents.map(async (subEvent) => {
        await notificationService.onNewSubEvent(
          subId,
          userId,
          subEvent.time.type,
          new Date(subEvent.time.startTime),
          subEvent.time.endTime ? new Date(subEvent.time.endTime) : null,
          newSubscription.polygonIds,
          subEvent.rain ? subEvent.rain : null,
          subEvent.time.until ? new Date(subEvent.time.until) : null,
          subEvent.time.recurrence ? subEvent.time.recurrence : null,
          email,
        );
      });

      return subId;
    } catch (error) {
      await connection.rollback();
      logger.error(error, 'Error in addSubscription');
      throw error;
    }
  },
  getSubscriptions: async (userId: number): Promise<TFullSubscription[]> => {
    await checkUserExist(userId);

    try {
      return await subscriptionRepo.getSubscriptions(userId);
    } catch (error) {
      logger.error(error, 'Error in getSubscriptions');
      throw error;
    }
  },
  deleteSubscription: async (
    userId: number,
    subscriptionId: number,
  ): Promise<boolean> => {
    await subscriptionService.verifyUserHaveSubscription(
      userId,
      subscriptionId,
    );

    const connection = await pool.getConnection();
    try {
      await notificationService.onUnSubscribe(subscriptionId);
      return await subscriptionRepo.deleteById(subscriptionId, connection);
    } catch (error) {
      logger.error(error, 'Error in deleteSubscription');
      throw error;
    }
  },
  getSubscription: async (
    userId: number,
    subscriptionId: number,
  ): Promise<TFullSubscription | null> => {
    await subscriptionService.verifyUserHaveSubscription(
      userId,
      subscriptionId,
    );

    return await subscriptionRepo.findFullSubscriptionById(subscriptionId);
  },
  verifyUserHaveSubscription: async (
    userId: number,
    subscriptionId: number,
  ) => {
    await checkUserExist(userId);

    const sub = await subscriptionRepo.findById(subscriptionId);
    if (sub === null || sub.userId !== userId) {
      throw new InvalidInputError(
        `Cannot find subscription with id=${subscriptionId}`,
      );
    }
  },
};
