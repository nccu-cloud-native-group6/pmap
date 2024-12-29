// Locally update the address map for each station
// Update the result to lib/static/address.json

// For locally executing:
// > npx tsx script/update_address_map.ts
import { loadEnv } from '../lib/local/config';
import axios from 'axios';
import { writeFileSync } from 'node:fs';
import addressMapJson from '../lib/static/address.json';

const addressMap: Record<string, string> = addressMapJson;

loadEnv();

const FILTER_COUNTYS = ['臺北市', '新北市'];

async function main() {
  await fetchCwaData();
}

async function fetchCwaData() {
  const cwa_token = process.env.CWA_TOKEN!;

  // Containing data about rainfall
  const rainFallUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0002-001?Authorization=${cwa_token}&RainfallElement=Past10Min,Past1hr`;
  const rainFallResponse = await fetchData(rainFallUrl);
  rainFallResponse.records.Station = filterByCounty(
    rainFallResponse.records.Station,
  );
  rainFallResponse.records.Station = await addAddress(
    rainFallResponse.records.Station,
  );


  rainFallResponse.records.Station.forEach((station: any) => {
    if(!addressMap[station.StationId]) {
      console.log(`New address found: ${station.StationId}: ${station.address}`);
      addressMap[station.StationId] = station.address;
    }
    addressMap[station.StationId] = station.address;
  });

  // Write to file
  console.log( JSON.stringify(addressMap, null, 2));
    
  writeFileSync('lib/static/address.json', JSON.stringify(addressMap, null, 2), 'utf8');
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

async function getAddress(lat: number, lng: number): Promise<string> {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`,
      {
        params: {
          access_token: process.env.BACKEND_MAPBOX_API_KEY,
          limit: 1,
        },
      }
    );
    const features = response.data.features;
    return features?.[0]?.place_name;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch address');
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Attach address to each station
 */
async function addAddress(stations: any) {
  return await Promise.all(
    stations.map(async (station: any) => {
      const address = await getAddress(
        station.GeoInfo.Coordinates[1].StationLatitude,
        station.GeoInfo.Coordinates[1].StationLongitude,
      );
      station.address = address;
      console.log(`Address: ${address}`);
      sleep(300);
      return station;
    }),
  )
}

main();