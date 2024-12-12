import { useState } from "react";

export function useLocation() {
  const [location, setLocation] = useState<{ lat?: number; lng?: number }>({});
  const [loadingLocation, setLoadingLocation] = useState(false);

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
