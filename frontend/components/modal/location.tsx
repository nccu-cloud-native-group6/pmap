"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { Button, Spinner } from "@nextui-org/react";
import { Location as LocationType } from "../../types/location";
import axios from "axios";


import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface LocationProps {
  location: LocationType;
  setLocation: (location: LocationType) => void;
  loadingLocation: boolean;
  error: string | null;
  onGetLocation: () => void;
  setAddress: (address: string) => void; // 新增 setAddress 回調
}

const Location: React.FC<LocationProps> = ({
  location,
  setLocation,
  loadingLocation,
  error,
  onGetLocation,
  setAddress,
}) => {
  const geocoderContainerRef = useRef<HTMLDivElement | null>(null);
  const geocoderInstanceRef = useRef<any>(null); // 保存 Geocoder 實例
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [address, setAddressState] = useState<string | null>(null);
  const [fetchingAddress, setFetchingAddress] = useState<boolean>(false);

  useEffect(() => {
    if (error && geocoderContainerRef.current && !geocoderInstanceRef.current) {
      const geocoder = new MapboxGeocoder({
        accessToken: MAPBOX_API_KEY || "",
        placeholder: "輸入地址或地名",
        proximity:
          location.lat && location.lng
            ? { longitude: location.lng, latitude: location.lat }
            : undefined,
        language: "zh-TW",
        country: "TW",
        marker: false, // 不自動添加 Marker
        mapboxgl: mapboxgl,
      });

      geocoder.addTo(geocoderContainerRef.current);
      geocoderInstanceRef.current = geocoder; // 保存 Geocoder 實例

      // 捕獲選擇結果
      geocoder.on("result", (event: any) => {
        const result = event.result;
        if (result?.geometry?.coordinates) {
          const [lng, lat] = result.geometry.coordinates;
          setLocation({ lat, lng });
          setSelectedAddress(result.place_name || "Unknown location");
          console.log("Selected location:", {
            lat,
            lng,
            address: result.place_name,
          });
        }
      });

      return () => {
        geocoderInstanceRef.current = null; // 清空實例
        if (geocoderContainerRef.current) {
          geocoderContainerRef.current.innerHTML = ""; // 清空容器
        }
        geocoder.clear(); // 卸載 Geocoder 控制器
      };
    }

    if (location.lat && location.lng && !fetchingAddress) {
      reverseGeocode(location.lat, location.lng);
    }
  }, [error, location, setLocation]);

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
      setAddressState(features?.[0]?.place_name || "Address not found");
      setAddress(features?.[0]?.place_name || "Address not found");
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddressState("Error retrieving address");
    } finally {
      setFetchingAddress(false);
    }
  };

  return (
    <div>
      <p className="font-bold">Current Location:</p>
      {loadingLocation ? (
        <div className="flex items-center space-x-2">
          <Spinner size="sm" /> 
          <span>Fetching location...</span>
        </div>
      ) : error ? (
        <div>
          {/* 顯示錯誤信息和重試按鈕 */}
          <div className="flex flex-row items-center space-x-2">
            <p className="text-red-500">{error}</p>
            <Button variant="light" color="primary" onPress={onGetLocation}>
              Retry
            </Button>
          </div>
          {/* Geocoder 搜索框 */}
          <div ref={geocoderContainerRef} className="geocoder-container mt-4"></div>
          {selectedAddress && (
            <p className="mt-2">
              <strong>{selectedAddress}</strong> 
            </p>
          )}
        </div>
      ) : location.lat && location.lng ? (
        <div>
            <div className="flex items-center space-x-2">
            {!fetchingAddress && address ? (
              <p>{address}</p>
            ) : (
              <>
              <Spinner size="sm" />
              <p>Reverse geocoding in progress...</p>
              </>
            )}
            </div>
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
