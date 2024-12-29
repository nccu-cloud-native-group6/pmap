import { Request, Response } from 'express';
import {
  InputEmptyError,
  InvalidInputError,
  NoTokenError,
  WrongTokenError,
} from '../Errors/errors.js';
import { postSubscriptionHandler } from '../App/Features/Subscription/postSubscription/postSubscriptionHandler.js';
import { getSubscriptionsHandler } from '../App/Features/Subscription/getSubscriptions/getSubscriptionHandler.js';
import { deleteSubscriptionsHandler } from '../App/Features/Subscription/deleteSubscription/deleteSubscriptionHandler.js';
import { getSubscriptionHandler } from '../App/Features/Subscription/getSubscription/getSubscriptionHandler.js';

/**
 * Verfiy user id and params.userId should match
 */
function verifyAndGetUserId(req: Request): number {
  if (req.decodedToken === undefined) {
    throw new NoTokenError();
  }
  const { id: userId } = req.decodedToken;

  // Verfiy user id and params.userId should match
  if (userId !== Number(req.params.userId)) {
    throw new WrongTokenError();
  }
  return userId;
}

export const subscriptionController = {
  createSubscription: async (req: Request, res: Response): Promise<void> => {
    const userId = verifyAndGetUserId(req);

    const response = await postSubscriptionHandler.handle(req.body, userId);
    res.status(200).json(response);
  },
  getSubscription: async (req: Request, res: Response): Promise<void> => {
    const userId = verifyAndGetUserId(req);
    const subId = Number(req.params.subscriptionId);

    if (isNaN(subId)) {
      throw new InvalidInputError('Subscription id is not a number');
    }

    const response = await getSubscriptionHandler.handle(userId, subId);
    res.status(200).json(response);
  },
  getSubscriptions: async (req: Request, res: Response): Promise<void> => {
    const userId = verifyAndGetUserId(req);

    const response = await getSubscriptionsHandler.handle(userId);
    res.status(200).json(response);
  },
  deleteSubscription: async (req: Request, res: Response): Promise<void> => {
    const userId = verifyAndGetUserId(req);
    const subId = Number(req.params.subscriptionId);

    if (isNaN(subId)) {
      throw new InvalidInputError('Subscription id is not a number');
    }

    const response = await deleteSubscriptionsHandler.handle(userId, subId);
    res.status(200).json(response);
  },
};
