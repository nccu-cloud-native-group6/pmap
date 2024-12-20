"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import * as turf from "@turf/turf";
import axios from "axios";

interface MapProps {
  onMapLoad?: (mapInstance: L.Map) => void;
}

const addHexGrid = async (map: L.Map) => {
  try {
    // 發送 API 請求
    const response = await axios.get("/api/proxy", {
      params: {
        lng: 24.9914,
        lat: 121.5667,
        radius: 9999,
      },
    });

    // 提取數據並檢查結構
    const rainGrid = response.data.data.rainGrid;
    if (!rainGrid || !rainGrid.hexGrid) {
      throw new Error('Invalid response structure: rainGrid or hexGrid is undefined');
    }

    const { cellSide, bbox, options } = rainGrid.hexGrid;

    // 使用 Turf.js 生成六邊形網格
    const hexGrid = turf.hexGrid(bbox, cellSide, options);
    hexGrid.features.forEach((feature) => {
      const coords: L.LatLngTuple[] = (
        feature.geometry.coordinates[0] as [number, number][]
      ).map(([lng, lat]) => [lat, lng] as L.LatLngTuple);
      const polygon = L.polygon(coords, {
        color: "blue",
        weight: 1,
        fillOpacity: 0.2,
      });
      polygon.addTo(map);
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
};

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
      addHexGrid(map);
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
      {/* 在這裡使用 MapLoader 子元件 */}
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
