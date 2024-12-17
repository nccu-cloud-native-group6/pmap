import { GetWeather } from './Types/api.js';

export const getWeatherRes = {
  customize: async (
    rainGrid: GetWeather.IGetWeatherResponse['data']['rainGrid'],
  ): Promise<GetWeather.IGetWeatherResponse> => {
    return {
      data: {
        rainGrid: rainGrid,
      },
    };
  },
};
