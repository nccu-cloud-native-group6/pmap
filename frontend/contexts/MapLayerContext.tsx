import React, { createContext, useContext, useRef } from "react";
import L from "leaflet";

interface MapLayerContextType {
  reportLayer: React.MutableRefObject<L.LayerGroup | null>;
}

const MapLayerContext = createContext<MapLayerContextType | undefined>(
  undefined
);

export const MapLayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 使用 useRef 管理報告圖層
  const reportLayer = useRef<L.LayerGroup | null>(L.layerGroup());

  return (
    <MapLayerContext.Provider value={{ reportLayer }}>
      {children}
    </MapLayerContext.Provider>
  );
};

export const useMapLayer = () => {
  const context = useContext(MapLayerContext);
  if (!context) {
    throw new Error("useMapLayer must be used within a MapLayerProvider");
  }
  return context;
};
