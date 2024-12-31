import React, { useState, useEffect } from 'react';
import LocationIcon from './LocationIcon';
import { toast } from 'react-toastify';
import { Spinner } from '@nextui-org/react';
import { findWeatherIdByLatLng } from '../../composables/findWeatherIdByLatLng';
import { useMapLayer } from '../../contexts/MapLayerContext';

interface LocationProps {
  mapRef: React.MutableRefObject<any>;           // 父層傳遞的地圖引用
  onWeatherIdFetch: (weatherId: number | null) => void; 
}

const Location: React.FC<LocationProps> = ({ mapRef, onWeatherIdFetch }) => {
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  // 每 10 秒更新天氣用
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // 取得地圖上的 locationLayer，用來加 Marker
  const { locationLayer } = useMapLayer();
  // 同步載入 Leaflet（若需要 Marker）
  const [leaflet, setLeaflet] = useState<any>(null);
  useEffect(() => {
    const loadLeaflet = async () => {
      const L = (await import('leaflet')).default;
      setLeaflet(L);
    };
    loadLeaflet();
  }, []);

  /**
   * 僅在使用者點擊時，呼叫一次 geolocation 取得 (lat, lng)，並飛過去 + 加 Marker
   */
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser.');
      setError(true);
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setMyLocation(newLoc);  // 存起來
        setError(false);
        setIsLoading(false);

        // 飛到該位置，並加 Marker
        if (mapRef?.current && leaflet && locationLayer.current) {
          flyTo(newLoc);
          addLocationMarker(newLoc);
        }
      },
      (err) => {
        console.error('Error fetching location:', err);
        toast.error('Failed to fetch location. Please enable location access.');
        setError(true);
        setIsLoading(false);
      }
    );
  };

  /**
   * 飛到指定座標
   */
  const flyTo = (loc: { lat: number; lng: number }) => {
    if (mapRef.current) {
      mapRef.current.flyTo([loc.lat, loc.lng], 17);
    }
  };

  /**
   * 在 locationLayer 放置一個 Marker
   */
  const addLocationMarker = (loc: { lat: number; lng: number }) => {
    // 先清空
    if (locationLayer.current) {
      locationLayer.current.clearLayers();
    }
    // 建立 icon
    const markerDiv = leaflet.divIcon({
      className: 'location-marker', 
      iconSize: [12, 12], 
    });
    // Marker
    const newMarker = leaflet.marker([loc.lat, loc.lng], { icon: markerDiv });
    // 加到圖層
    if (locationLayer.current) {
      locationLayer.current.addLayer(newMarker);
    }
  };

  /**
   * 每次 myLocation 改變(只會改變一次)，就立刻抓天氣，並開始 setInterval 每 10 秒更新
   */
  useEffect(() => {
    if (!myLocation) return;

    // 先抓一次天氣
    fetchWeather(myLocation);

    // 開始每 10 秒抓一次
    const id = setInterval(() => {
      fetchWeather(myLocation);
    }, 10000);
    setIntervalId(id);

    // 組件卸載或 myLocation 改變時，清除 interval
    return () => {
      if (id) clearInterval(id);
    };
  }, [myLocation]);

  /**
   * 真正抓天氣的函式
   */
  const fetchWeather = async (loc: { lat: number; lng: number }) => {
    try {
      // 不需要一直 setIsLoading，避免 icon 一直轉；若要也可以
      const weatherId = await findWeatherIdByLatLng(loc.lat, loc.lng, true);
      onWeatherIdFetch(weatherId !== null ? Number(weatherId) : null);
    } catch (error) {
      console.error('Error fetching weather ID:', error);
      toast.error('Failed to fetch weather information.');
    }
  };

  return (
    <span
      onClick={handleGetLocation}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: isLoading ? 'default' : 'pointer',
        color: error ? 'red' : 'inherit',
      }}
    >
      {isLoading ? <Spinner size="sm" /> : <LocationIcon />}
    </span>
  );
};

export default Location;
