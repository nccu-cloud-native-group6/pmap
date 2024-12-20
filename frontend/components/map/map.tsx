"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { addHexGrid } from "./addHexGrid";

interface MapProps {
  onMapLoad?: (mapInstance: L.Map) => void;
}

// 建立一個子元件，透過 useMap() 取得地圖實例，然後將實例傳給 onMapLoad 回呼
function MapLoader({
  onMapLoad,
}: {
  onMapLoad?: (mapInstance: L.Map) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (map && onMapLoad) {
      onMapLoad(map);
      addHexGrid(map); // 使用獨立的 addHexGrid 函數
    }
  }, [map, onMapLoad]);

  return null;
}

const Map: React.FC<MapProps> = ({ onMapLoad }) => {
  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);

  const center: [number, number] = [25.033, 121.5654];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <MapLoader onMapLoad={onMapLoad} />
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
        id="mapbox/streets-v11"
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
