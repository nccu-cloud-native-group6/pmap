import { useState } from "react";
import { Location } from "../../types/location"; // 引入 Location type

export function useLocation() {
  const [location, setLocation] = useState<Location>({ lat: 0, lng: 0 });
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingLocation(false);
      },
      (error) => {
        console.error("Error retrieving location", error);
        setLoadingLocation(false);
      }
    );
  };

  return { location, loadingLocation, getLocation };
}