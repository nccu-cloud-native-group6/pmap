import { Request, Response } from 'express';
import {
  InputEmptyError,
  NoTokenError,
  WrongTokenError,
} from '../Errors/errors.js';
import { postSubscriptionHandler } from '../App/Features/Subscription/postSubscription/postSubscriptionHandler.js';

export const subscriptionController = {
  createSubscription: async (req: Request, res: Response): Promise<void> => {
    if (req.decodedToken === undefined) {
      throw new NoTokenError();
    }
    const { id: userId } = req.decodedToken;

    // Verfiy user id and params.userId should match
    if (userId !== Number(req.params.userId)) {
      throw new WrongTokenError();
    }

    const response = await postSubscriptionHandler.handle(
      req.body,
      Number(req.params.userId),
    );
    res.status(200).json(response);
  },
  getSuscription: async (req: Request, res: Response): Promise<void> => {
    // TODO
  },
  getSubscriptions: async (req: Request, res: Response): Promise<void> => {
    //TODO
  },
  deleteSubscription: async (req: Request, res: Response): Promise<void> => {
    //TODO
  },

  getWeather: async (req: Request, res: Response): Promise<void> => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius);
    if (!lat || !lng || !radius) {
      throw new InputEmptyError();
    }
    // console.log(lat, lng, radius);

    // const response = await postSubscriptionHandler.handle({ lat, lng, radius });
    res.status(200).json({});
  },
};
