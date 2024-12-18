// components/Location.tsx
"use client";

import React from "react";
import { Button, Spinner } from "@nextui-org/react";

interface LocationProps {
  location: { lat: number | null; lng: number | null };
  loadingLocation: boolean;
  onGetLocation: () => void;
}

const Location: React.FC<LocationProps> = ({ location, loadingLocation, onGetLocation }) => {
  return (
    <div className="mt-4">
      <p>Current Location:</p>
      {location.lat && location.lng ? (
        <p>
          Lat: {location.lat}, Lng: {location.lng}
        </p>
      ) : loadingLocation ? (
        <div className="flex items-center space-x-2">
          <Spinner size="sm" /> <span>Getting location...</span>
        </div>
      ) : (
        <Button variant="light" color="primary" onPress={onGetLocation}>
          Get Current Location
        </Button>
      )}
    </div>
  );
};

export default Location;
