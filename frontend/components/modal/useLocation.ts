import { useState } from "react";
import { Location } from "../../types/location"; // Location type

export function useLocation() {
  const [location, setLocation] = useState<Location>({ lat: 0, lng: 0 });
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // 新增錯誤狀態

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);
    setError(null); // 重置錯誤狀態

    let timeoutId: NodeJS.Timeout;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId); // 清除超時計時器
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingLocation(false);
      },
      () => {
        clearTimeout(timeoutId); // 清除超時計時器
        setError("Permission denied or location unavailable."); // 處理不同的錯誤
        setLoadingLocation(false);
      }
    );

    // 設置超時邏輯
    timeoutId = setTimeout(() => {
      setError("Failed to retrieve location within 10 seconds.");
      setLoadingLocation(false);
      console.error("Geolocation request timed out after 10 seconds.");
    }, 10000); // 超時設定為 10 秒
  };

  return { location, setLocation, loadingLocation, error, getLocation };
}
