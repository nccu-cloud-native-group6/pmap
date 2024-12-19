import pool from '../../Database/database.js';
import { GetWeather } from '../../App/Features/Weather/GetWeather/Types/api.js';
import { hexGrid } from '../../Database/constant.js';
import { polygonRepo } from '../Repository/PolygonRepo.js';
import { tool } from '../../utils/tool.js';

/**
 * A simple cache for weather data
 * - Key is the GetWeather.TGetWeatherParams.toString()
 * - Value is the rainGrid data with hash. The hash is for checking if data is updated
 */
const getWeatherCache = new Map<
  string,
  GetWeather.IGetWeatherResponse['data']['rainGrid'] & { hash: string }
>();

/**
 * The cache update interval in seconds
 */
const cacheUpdateSeconds = 9;

/**
 * The cache size limit for preventing memory leak
 * Currently, our frontend will always send the same request
 * So in ideal cases, the cache size should be 1
 * But we set it to 10 for flexibility
 */
const cacheSizeLimit = 10;

setInterval(async () => {
  await updateWeatherCache();
}, cacheUpdateSeconds * 1000);

async function updateWeatherCache() {
  if (getWeatherCache.size >= cacheSizeLimit) {
    console.log('GetWeather API: Cache size limit reached, clear the cache');
    getWeatherCache.clear();
    return;
  }

  // Update the cache regularly
  for (const weatherParams of getWeatherCache.keys()) {
    const oldWeatherData = getWeatherCache.get(weatherParams)!;
    const oldWeatherDataHash = oldWeatherData.hash;

    const newData = await weatherService.getPolygonIdToProperties(
      JSON.parse(weatherParams) as GetWeather.TGetWeatherParams,
    );
    const newHash = tool.generateHash(newData);

    // No update detected
    if (newHash === oldWeatherDataHash) {
      console.log(
        'GetWeather API: No weather updates detected, last updated at: ',
        oldWeatherData.updatedAt,
      );
      continue;
    }

    // Update the cache data and hash
    getWeatherCache.set(weatherParams, {
      updatedAt: new Date().toISOString(),
      hexGrid: hexGrid,
      polyginIdToPreperties: newData,
      hash: newHash,
    });
    console.log('GetWeather API: Updated the cache');
  }
}

export const weatherService = {
  getPolygonIdToProperties: async (
    params: GetWeather.TGetWeatherParams,
  ): Promise<
    GetWeather.IGetWeatherResponse['data']['rainGrid']['polyginIdToPreperties']
  > => {
    const connection = await pool.getConnection();

    let polyginIdToPreperties = {};
    try {
      const polygons = await polygonRepo.getPolygons(
        params.lat,
        params.lng,
        params.radius,
      );
      if (polygons !== null) {
        polyginIdToPreperties = polygons?.map((polygon) => {
          return {
            [Number(polygon.id)]: {
              avgRainDegree: polygon.avgRainDegree,
            },
          };
        });
      }
    } catch (error) {
    } finally {
      connection.release();
    }

    return polyginIdToPreperties;
  },
  getWeather: async (
    params: GetWeather.TGetWeatherParams,
  ): Promise<GetWeather.IGetWeatherResponse['data']['rainGrid']> => {
    // Check if we can get the data from cache
    const paramsStr = JSON.stringify(params);
    const cacheData = getWeatherCache.get(paramsStr);
    if (cacheData !== undefined) {
      console.log('GetWeather API: Cache hit');
      const { hash, ...weatherData } = cacheData;
      return weatherData;
    }

    // The following code is the fallback when cache miss
    // In most cases, the cache should be hit,
    // So the following code is rarely executed, except for the first time
    const ploygonIdToProperties =
      await weatherService.getPolygonIdToProperties(params);

    const result = {
      updatedAt: new Date().toISOString(),
      hexGrid: hexGrid,
      polyginIdToPreperties: ploygonIdToProperties,
    };
    console.log('GetWeather API: Cache miss, store the result to cache');
    getWeatherCache.set(paramsStr, {
      ...result,
      hash: tool.generateHash(result),
    });
    return result;
  },
};
