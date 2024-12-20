'use client';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTheme } from '../../contexts/ThemeContext';
import { addHexGrid } from "./addHexGrid";

interface MapProps {
  onMapLoad?: (mapInstance: L.Map) => void;
}

// 子元件，用於處理地圖加載和動態更新
function MapLoader({ onMapLoad }: { onMapLoad?: (mapInstance: L.Map) => void }) {
  const map = useMap();
  const { isDark } = useTheme(); // 取得主題狀態
  const layerGroupRef = useRef<L.LayerGroup>(L.layerGroup()); // 使用 LayerGroup 管理圖層

  useEffect(() => {
    if (map) {
      onMapLoad?.(map);
      addHexGrid(map, isDark, layerGroupRef.current); // 傳遞 layerGroupRef
    }
  }, [map, onMapLoad, isDark]); // 當主題變化時重新繪製

  return null;
}

const Map: React.FC<MapProps> = ({ onMapLoad }) => {
  const { isDark } = useTheme();

  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);

  const center: [number, number] = [25.033, 121.5654];

  return (
    <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
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
