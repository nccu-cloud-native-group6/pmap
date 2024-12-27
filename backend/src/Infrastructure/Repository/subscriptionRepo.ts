import logger from '../../Logger/index.js';
import { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { PostSubscription } from '../../App/Features/Subscription/postSubscription/Types/api.js';
import { toDateString, toTimeString } from '../../utils/formatter.js';

export const subscriptionRepo = {
  createSubscription: async (
    subscription: PostSubscription.INewSubscription,
    connection: PoolConnection,
  ): Promise<number> => {
    try {
      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO Subscriptions (nickName, isActive, userId, locationId, createdAt, updatedAt) VALUES (?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())',
        [
          subscription.nickName,
          subscription.isActive,
          subscription.userId,
          subscription.locationId,
        ],
      );
      return result.insertId;
    } catch (error) {
      logger.error(error, 'Error in createSubscription');
      throw error;
    }
  },
  createSubPolygons: async (
    polygonIds: number[],
    subscriptionId: number,
    connection: PoolConnection,
  ): Promise<void> => {
    try {
      const subPolygonsData = polygonIds.map(
        (id) => `(${subscriptionId}, ${id})`,
      );

      const bulkInsertSql = `
      INSERT INTO SubPolygons (subscriptionId, polygonId)
      VALUES ${subPolygonsData};
      `;

      await connection.query<ResultSetHeader[]>(bulkInsertSql);
    } catch (error) {
      logger.error(error, 'Error in createSubPolygons');
      throw error;
    }
  },
  createSubEvents: async (
    subEvents: PostSubscription.INewSubEvent[],
    subId: Number,
    connection: PoolConnection,
  ): Promise<void> => {
    try {
      // Perpare for mysql format
      const combinedValues = (values: any[]) => {
        const formatValues = values.map((value) => {
          if (typeof value === 'boolean') {
            console.log('find boolean', value);
            return value ? 1 : 0;
          }

          if (value == null) {
            // null or undefined will return mysql NULL
            return 'NULL';
          }
          // Otherwise, return the value in string format
          return `'${value}'`;
        });
        return `(${formatValues.join(', ')})`;
      };

      const subEventsData = subEvents.map((event) => {
        const startDate = toDateString(event.startDate);
        const untilDate = toDateString(event.until);

        const startDt = event.startDate ? new Date(event.startDate) : null;
        const endDt = event.endTime ? new Date(event.endTime) : null;

        const startTime = toTimeString(startDt);
        const endTime = toTimeString(endDt);

        const isActive = event.isActive ?? 1;

        return combinedValues([
          subId,
          event.eventType,
          event.rainDegree,
          event.operator,
          startDate,
          startTime,
          endTime,
          event.recurrence,
          untilDate,
          isActive,
        ]);
      });

      const bulkInsertSql = `
      INSERT INTO SubEvents (subscriptionId, eventType, rainDegree, operator, startDate, startTime, endTime, recurrence, until, isActive)
      VALUES ${subEventsData.join(', ')};
      `;

      await connection.query<ResultSetHeader[]>(bulkInsertSql);
    } catch (error) {
      logger.error(error, 'Error in createSubEvents');
      throw error;
    }
  },
};
