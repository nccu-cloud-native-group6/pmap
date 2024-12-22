import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spinner } from "@nextui-org/react";

interface LocationProps {
  location: { lat: number; lng: number } | null; // 接收經緯度作為 props
}

const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const Location: React.FC<LocationProps> = ({ location }) => {
  const [address, setAddress] = useState<string>("尚未查詢地址");
  const [fetching, setFetching] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState(location); // 追蹤當前位置避免競爭條件

  useEffect(() => {
    const reverseGeocode = async () => {
      if (!location) {
        setAddress("Please select a location first");
        return;
      }

      const { lat, lng } = location;

      if (!lat || !lng) {
        setAddress("Invalid location coordinates");
        return;
      }

      try {
        setFetching(true);

        console.log("Fetching address for:", { lat, lng });

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
          console.log("Fetched address:", placeName);

          // 確保只有當前位置的請求結果被更新
          if (currentLocation === location) {
            setAddress(placeName || "找不到地址");
          }
        } else {
          setAddress("No address found");
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        setAddress("地址查詢失敗");
      } finally {
        setFetching(false);
      }
    };

    setCurrentLocation(location); // 更新當前位置
    reverseGeocode();
  }, [location, currentLocation]); // 添加 `currentLocation` 作為依賴

  return (
    <div>
      <h3>地址：</h3>
      {fetching ? (
        <Spinner />
      ) : (
        <p
          style={{
            color:
              address === "地址查詢失敗" ||
              address === "Invalid location coordinates" ||
              address === "Please select a location first"
                ? "red"
                : "default",
          }}
        >
          {address}
        </p>
      )}
    </div>
  );
};

export default Location;
