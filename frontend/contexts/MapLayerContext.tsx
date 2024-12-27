import React, { createContext, useContext, useRef } from "react";
import L from "leaflet";

interface MapLayerContextType {
  reportLayer: React.MutableRefObject<L.LayerGroup | null>;
  weatherLayer: React.MutableRefObject<L.LayerGroup | null>;
}

const MapLayerContext = createContext<MapLayerContextType | undefined>(
  undefined
);

export const MapLayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const reportLayer = useRef<L.LayerGroup | null>(L.layerGroup());
  const weatherLayer = useRef<L.LayerGroup | null>(L.layerGroup());

  return (
    <MapLayerContext.Provider value={{ reportLayer, weatherLayer }}>
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
