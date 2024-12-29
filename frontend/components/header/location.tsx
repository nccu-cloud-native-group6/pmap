import React, { useState } from 'react';
import LocationIcon from './LocationIcon';
import { toast } from 'react-toastify';

interface LocationProps {
  mapRef: React.MutableRefObject<any>;
}

const Location: React.FC<LocationProps> = ({ mapRef }) => {
  const [error, setError] = useState(false);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log(`Latitude: ${newLocation.lat}, Longitude: ${newLocation.lng}`);
          flyTo(newLocation); // 呼叫 flyTo 函數來移動地圖視角
          setError(false); // 恢復正常顏色
        },
        (error) => {
          console.error('Error fetching location:', error);
          setError(true); // 設定錯誤狀態
          toast.error('Failed to fetch location. Please enable location access.');
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setError(true); // 設定錯誤狀態
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const flyTo = (location: { lat: number; lng: number }) => {
    console.log('Flying to:', location);
    if (mapRef && mapRef.current) {
      mapRef.current.flyTo([location.lat, location.lng], 17);
    }
  };

  return (
    <span
      onClick={handleGetLocation}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
        color: error ? 'red' : 'inherit', // 根據錯誤狀態改變顏色
      }}
    >
      <LocationIcon />
    </span>
  );
};

export default Location;