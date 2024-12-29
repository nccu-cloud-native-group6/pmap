import React, { useState, useEffect } from 'react';
import LocationIcon from './LocationIcon';
import { toast } from 'react-toastify';
import { useMapLayer } from '../../contexts/MapLayerContext';
import { Spinner } from '@nextui-org/react';
import { findWeatherIdByLatLng } from '../../composables/findWeatherIdByLatLng';

interface LocationProps {
  mapRef: React.MutableRefObject<any>;
  onWeatherIdFetch: (weatherId: number | null) => void; // 用於傳遞天氣 ID 的回調
}

const Location: React.FC<LocationProps> = ({ mapRef, onWeatherIdFetch }) => {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 加載狀態
  const { locationLayer } = useMapLayer(); // 使用報告圖層
  const [leaflet, setLeaflet] = useState<any>(null);

  useEffect(() => {
    // 僅在客戶端動態載入 Leaflet
    const loadLeaflet = async () => {
      const L = (await import('leaflet')).default;
      setLeaflet(L);
    };
    loadLeaflet();
  }, []);

  const handleGetLocation = async () => {
    if (navigator.geolocation) {
      setIsLoading(true); // 開始加載
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          try {
            const weatherId = await findWeatherIdByLatLng(newLocation.lat, newLocation.lng, true); // 查找天氣 ID
            onWeatherIdFetch(weatherId !== null ? Number(weatherId) : null); // 傳遞天氣 ID
            flyTo(newLocation); // 呼叫 flyTo 函數來移動地圖視角
            addLocationMarker(newLocation); // 添加標記
            setError(false); // 恢復正常顏色
          } catch (err) {
            console.error('Error fetching weather ID:', err);
            toast.error('Failed to fetch weather information.');
          } finally {
            setIsLoading(false); // 停止加載
          }
        },
        (error) => {
          console.error('Error fetching location:', error);
          setError(true); // 設定錯誤狀態
          toast.error('Failed to fetch location. Please enable location access.');
          setIsLoading(false); // 停止加載
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

  const addLocationMarker = (location: { lat: number; lng: number }) => {
    if (mapRef && mapRef.current && locationLayer.current) {
      // 清空圖層
      locationLayer.current.clearLayers();
      const markerDiv = leaflet.divIcon({
        className: 'location-marker', // 自定義樣式
        iconSize: [12, 12], // 圖標大小
      });

      const newMarker = leaflet.marker([location.lat, location.lng], { icon: markerDiv });
      locationLayer.current.addLayer(newMarker); // 添加到報告圖層
      locationLayer.current.addTo(mapRef.current); // 確保圖層在地圖上
    } else {
      console.error('Map reference not found.');
    }
  };

  return (
    <span
      onClick={handleGetLocation}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: isLoading ? 'default' : 'pointer', // 加載中禁用點擊
        color: error ? 'red' : 'inherit', // 根據錯誤狀態改變顏色
      }}
    >
      {isLoading ? <Spinner size="sm" /> : <LocationIcon />}
    </span>
  );
};

export default Location;
