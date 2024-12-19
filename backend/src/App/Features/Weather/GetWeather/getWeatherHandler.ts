import { GetWeather } from './Types/api.js';
import { weatherService } from '../../../../Infrastructure/Service/weatherService.js';
import { getWeatherRes } from './getWeatherRes.js';

export const getWeatherHandler = {
  handle: async (
    params: GetWeather.TGetWeatherParams,
  ): Promise<GetWeather.IGetWeatherResponse> => {
    const result = await weatherService.getWeather(params);

    return getWeatherRes.customize(result);
  },
};
