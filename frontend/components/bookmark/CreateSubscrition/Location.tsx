import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spinner } from "@nextui-org/react";

interface LocationProps {
  location: { lat: number; lng: number } | null; // 接收經緯度作為 props
}

const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const Location: React.FC<LocationProps> = ({ location }) => {
  const [address, setAddress] = useState<string | null>(null); // 地址狀態
  const [error, setError] = useState<string | null>(null); // 錯誤訊息狀態
  const [fetching, setFetching] = useState<boolean>(false); // 是否正在查詢

  useEffect(() => {
    const reverseGeocode = async () => {
      if (!location || !location.lat || !location.lng) {
        setAddress(null);
        setError("Please select a location first");
        return;
      }

      const { lat, lng } = location;

      try {
        setFetching(true);
        setError(null); // 清除舊的錯誤訊息

        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`,
          {
            params: {
              access_token: MAPBOX_API_KEY,
              limit: 1,
            },
          }
        );

        if (response.data && response.data.features?.length > 0) {
          const placeName = response.data.features[0].place_name;
          setAddress(placeName || "找不到地址");
        } else {
          setAddress(null);
          setError("No address found");
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        setAddress(null);
        setError("地址查詢失敗");
      } finally {
        setFetching(false);
      }
    };

    reverseGeocode();
  }, [location]); // 僅監聽 location 的變化

  return (
    <div>
      <h3>Address: </h3>
      {fetching ? (
        <Spinner />
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p> // 顯示錯誤訊息
      ) : (
        <p style={{ color: "black" }}>{address}</p> // 顯示地址
      )}
    </div>
  );
};

export default Location;