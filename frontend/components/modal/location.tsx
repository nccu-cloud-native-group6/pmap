"use client";

import React, { useState, useEffect } from "react";
import { Button, Spinner } from "@nextui-org/react";
import axios from "axios";
import { Location as LocationType } from "../../types/location";

const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface LocationProps {
  location: LocationType;
  loadingLocation: boolean;
  error: string | null;
  onGetLocation: () => void;
}

const Location: React.FC<LocationProps> = ({ location, loadingLocation, error, onGetLocation }) => {
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
