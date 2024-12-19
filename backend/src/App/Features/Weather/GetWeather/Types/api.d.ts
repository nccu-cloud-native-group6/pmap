import type { paths } from '../../../../../Types/api.d.ts';

declare namespace GetWeather {
  type TGetWeatherParams = paths['/weather']['get']['parameters']['query'];

  interface IGetWeatherResponse {
    data: paths['/weather']['get']['responses']['200']['content']['application/json'];
  }
}
