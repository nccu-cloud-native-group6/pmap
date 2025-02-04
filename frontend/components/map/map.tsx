"use client";
import { useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTheme } from "../../contexts/ThemeContext";
import { useMap as useMapContext } from "../../contexts/MapContext"; // 使用 MapContext
import { addHexGrid } from "./addHexGrid";
import { Location } from "../../types/location";
import { toast } from "react-toastify";
import { useMapLayer } from "../../contexts/MapLayerContext"; // 使用 MapLayerContext
import { useUser } from "../../contexts/UserContext"; // 使用 UserContext
import { addReport } from "./addReport";
import getColor from "./getColor";

type ToastId = string | number;

interface MapProps {
  onLoad?: (mapInstance: L.Map) => void; // 用 onLoad 取代 onMapLoad
}
function MapLoader({ onLoad }: { onLoad?: (mapInstance: L.Map) => void }) {
  const map = useMap();
  const { isDark } = useTheme();
  const { state, dispatch } = useMapContext();
  const layerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const notificationRef = useRef<ToastId | null>(null); // 用於追蹤通知 ID
  const { subLayer, locationLayer, reportLayer, weatherLayer } = useMapLayer(); // 使用 MapLayerContext
  const user = useUser();

  const polygonIdToLatLng: { [key: string]: L.LatLng } = {}; // Define the variable
  const hexesById: { [key: string]: L.Polygon } = {}; // Define hexesById

  const updateStyles = useCallback(
    (ids: string[] = state.selectedIds, isDarkTheme: boolean) => {
      Object.keys(polygonIdToLatLng).forEach((polygonId) => {
        const polygonElement = hexesById[polygonId];
        const propertiesMapRef: { [key: string]: { avgRainDegree: number } } = {}; // Define propertiesMapRef
        const hexValue = propertiesMapRef[polygonId]?.avgRainDegree || 0;

        if (polygonElement) {
          polygonElement.setStyle({
            fillColor: state.selectedIds.includes(polygonId)
              ? polygonId === state.selectedIds[0]
                ? "#ff6666" // 主選中顏色
                : "#ff6666" // 鄰居選中顏色
              : getColor(hexValue, isDarkTheme),
            fillOpacity: state.selectedIds.includes(polygonId) ? 0.8 : 0.5,
          });
        }
      });
    },
    []
  );


  useEffect(() => {
    if (map) {
      onLoad?.(map);

      const tileLayer = L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/${
          isDark ? "dark-v10" : "streets-v11"
        }/tiles/{z}/{x}/{y}?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        }`,
        {
          tileSize: 512,
          zoomOffset: -1,
        }
      ).addTo(map);

      // 初始化圖層控制器
      const layersControl = L.control.layers(
        { "Base Map": tileLayer },
        { 
          Reports: reportLayer.current!, // 添加報告圖層到控制器
          Weather: weatherLayer.current!, // 添加天氣圖層到控制器
          Subscription: subLayer.current! // 添加訂閱圖層到控制器
        },
        { collapsed: false }
      ).addTo(map);

      // 確保報告圖層加到地圖上
      if (reportLayer.current && !map.hasLayer(reportLayer.current)) {
        reportLayer.current?.addTo(map);
      }

      if (locationLayer.current && !map.hasLayer(locationLayer.current)) {
        locationLayer.current?.addTo(map);
      }

      if (subLayer.current && !map.hasLayer(subLayer.current)) {
        subLayer.current?.addTo(map);
      }

      addHexGrid(
        map,
        isDark,
        layerGroupRef.current,
        state.hoverEnabled,
        state.depth,
        10000,
        30,
        state.selectedIds,
        (ids: string[]) => dispatch({ type: "SET_SELECTED_IDS", payload: ids }),
        (location: Location) => dispatch({ type: "SET_SELECTED_LOCATION", payload: location }),
        weatherLayer.current!, // 使用天氣圖層
        updateStyles
      );

      addReport(
        reportLayer.current!, // 使用報告圖層
        user.user?.access_token || ""
      )

      const intervalId = setInterval(() => {
        
        if(!user.user?.access_token) {
          return;
        }
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour12: false });

        // 更新 HexGrid
        addHexGrid(
          map,
          isDark,
          layerGroupRef.current,
          state.hoverEnabled,
          state.depth,
          10000,
          30,
          state.selectedIds,
          (ids: string[]) => {
            dispatch({ type: "SET_SELECTED_IDS", payload: ids });
          }, // 更新選中的 ID 列表
          (location: Location) =>
            dispatch({ type: "SET_SELECTED_LOCATION", payload: location }),
          weatherLayer.current! ,// 使用天氣圖層,
          updateStyles
        );

        addReport(
          reportLayer.current!, // 使用報告圖層
          // 使用 UserContext 取得 token
          user.user?.access_token || ""
        )

        // 推送或更新通知
        if (notificationRef.current && toast.isActive(notificationRef.current)) {
          toast.update(notificationRef.current, {
            render: `Weather and Report updated at ${timeString}`,
            autoClose: 2000,
          });
        } else {
          notificationRef.current = toast.info(`HexGrid updated at ${timeString}`, {
            position: "top-left",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: isDark ? "dark" : "light",
          });
        }
      }, 10000);

      return () => {
        clearInterval(intervalId);
        if (notificationRef.current) {
          toast.dismiss(notificationRef.current);
        }
        map.removeControl(layersControl); // 清除圖層控制器
      };
    }
  }, [map, onLoad, isDark, state.hoverEnabled, state.depth, state.selectedIds]);

  return null;
}


const Map: React.FC<MapProps> = ({ onLoad }) => {
  const { isDark } = useTheme();

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
      style={{ height: "100%", width: "100%", zIndex: "1" }}
    >
      <MapLoader onLoad={onLoad} /> {/* 使用 onLoad */}
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/mapbox/${
          isDark ? "dark-v10" : "streets-v11"
        }/tiles/{z}/{x}/{y}?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        }`}
        tileSize={512}
        zoomOffset={-1}
      />
    </MapContainer>
  );
};

export default Map;
