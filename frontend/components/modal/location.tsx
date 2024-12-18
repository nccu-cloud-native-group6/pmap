"use client";

import React, { useState, useEffect } from "react";
import { Button, Spinner } from "@nextui-org/react";
import axios from "axios";
import { Location as LocationType } from "../../types/location";
import { Geocoder } from "@mapbox/search-js-react";

const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const GeocoderElement = Geocoder as unknown as React.ElementType;

interface LocationProps {
  location: LocationType;
  setLocation: (location: LocationType) => void; // 傳入用於更新 location 的方法
  loadingLocation: boolean;
  error: string | null;
  onGetLocation: () => void;
}

const Location: React.FC<LocationProps> = ({
  location,
  setLocation,
  loadingLocation,
  error,
  onGetLocation,
}) => {
  const [address, setAddress] = useState<string | null>(null);
  const [fetchingAddress, setFetchingAddress] = useState<boolean>(false);

  useEffect(() => {
    if (location?.lat && location?.lng) {
      reverseGeocode(location.lat, location.lng);
    }
  }, [location]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setFetchingAddress(true);
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`,
        {
          params: {
            access_token: MAPBOX_API_KEY,
            limit: 1,
          },
        }
      );
      const features = response.data.features;
      setAddress(features?.[0]?.place_name || "Address not found");
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Error retrieving address");
    } finally {
      setFetchingAddress(false);
    }
  };

  const handleRetrieve = (result: any) => {
    if (result?.geometry?.coordinates) {
      const [lng, lat] = result.geometry.coordinates;
      const newLocation = { lat, lng }; // 更新地點的經緯度
      setLocation(newLocation); // 更新父層 location
      setAddress(result.place_name || "Unknown location");
      console.log("Selected location updated:", newLocation);
    }
  };

  return (
    <div className="mt-4">
      <p>Current Location:</p>
      {loadingLocation ? (
        <div className="flex items-center space-x-2">
          <Spinner size="sm" /> <span>Fetching location...</span>
        </div>
      ) : error ? (
        <div className="text-red-500">
          <p>{error}</p>
          <Button variant="light" color="primary" onPress={onGetLocation}>
            Retry
          </Button>
          <GeocoderElement
            accessToken={MAPBOX_API_KEY || ""}
            options={{
              language: "zh-TW",
              country: "TW",
            }}
            onRetrieve={handleRetrieve} // 捕獲選擇的地點
            placeholder="輸入地址或地名"
          />
        </div>
      ) : location && address ? (
        <p>{address}</p>
      ) : (
        <Button variant="light" color="primary" onPress={onGetLocation}>
          Get Current Location
        </Button>
      )}
    </div>
  );
};

export default Location;
