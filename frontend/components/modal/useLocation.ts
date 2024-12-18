import { useState } from "react";
import { Location } from "../../types/location"; // Location type

export function useLocation() {
  const [location, setLocation] = useState<Location>({lat: 0, lng: 0});
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // 新增錯誤狀態

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);
    setError(null); // 重置錯誤狀態

    navigator.geolocation.getCurrentPosition(
      (position) => {
      setTimeout(() => {
        setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        });
        setLoadingLocation(false);
      }, 10000); // 模擬 10 秒的 loading
      },
      () => {
        setError("Permission denied or location unavailable."); // 處理不同的錯誤
        setLoadingLocation(false);
      }
    );
  };

  return { location,setLocation, loadingLocation, error, getLocation };
}