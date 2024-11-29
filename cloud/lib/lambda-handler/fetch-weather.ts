import axios from 'axios';
import { gzipSync } from 'node:zlib';

const FILTER_COUNTYS = ['臺北市'];

export const handler = async (): Promise<any> => {
  return await main();
};

async function main() {
  let cwaData = await fetchCwaData();

  // Do compression to reduce response size
  // The maximum size of lambda event payload is 256 KB
  const compressedData = do_gzip_base64(cwaData);
  return compressedData;
}

async function fetchCwaData(): Promise<string> {
  const cwa_token = process.env.CWA_TOKEN!;

  // Containing data about rainfall
  const rainFallUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0002-001?Authorization=${cwa_token}&RainfallElement=Past10Min`;
  const rainFallResponse = await fetchData(rainFallUrl);
  rainFallResponse.records.Station = filterByCounty(
    rainFallResponse.records.Station,
  );

  // Containing data about temperature, weather-description, etc.
  const weatherUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=${cwa_token}`;
  const weatherResponse = await fetchData(weatherUrl);
  weatherResponse.records.Station = filterByCounty(
    weatherResponse.records.Station,
  );

  return JSON.stringify({
    rainAPI: rainFallResponse,
    weatherAPI: weatherResponse,
  });
}

function filterByCounty(stations: any) {
  return stations.filter((station: any) =>
    FILTER_COUNTYS.includes(station.GeoInfo.CountyName),
  );
}

async function fetchData(url: string): Promise<any> {
  const response = await axios.get(url);
  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch cwa data, ${response.status}: ${response.data}`,
    );
  }
  return response.data;
}

function do_gzip_base64(input: string) {
  let output = gzipSync(input);
  return Buffer.from(output).toString('base64');
}
