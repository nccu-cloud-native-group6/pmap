import { Request, Response } from 'express';
import { InputEmptyError } from '../Errors/errors.js';
import { getWeatherHandler } from '../App/Features/Weather/GetWeather/getWeatherHandler.js';

export const weatherController = {
  getWeather: async (req: Request, res: Response): Promise<void> => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius);
    if (!lat || !lng || !radius) {
      throw new InputEmptyError();
    }
    console.log(lat, lng, radius);

    const response = await getWeatherHandler.handle({ lat, lng, radius });
    res.status(200).json(response);
  },
};
