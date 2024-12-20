'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTheme } from '../../contexts/ThemeContext'; // 引入全局主題狀態

interface MapProps {
  onMapLoad?: (mapInstance: L.Map) => void;
}

// 子元件，用於傳遞地圖實例
function MapLoader({ onMapLoad }: { onMapLoad?: (mapInstance: L.Map) => void }) {
  const map = useMap();

  useEffect(() => {
    if (map && onMapLoad) {
      onMapLoad(map);
    }
  }, [map, onMapLoad]);

  return null;
}

const Map: React.FC<MapProps> = ({ onMapLoad }) => {
  const { isDark } = useTheme(); // 從主題上下文中獲取主題狀態

  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  const center: [number, number] = [25.0330, 121.5654];

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
      {/* 使用 MapLoader 子元件 */}
      <MapLoader onMapLoad={onMapLoad} />
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/mapbox/${
          isDark ? 'dark-v10' : 'streets-v11'
        }/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
        tileSize={512}
        zoomOffset={-1}
      />
      <Marker position={center}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
