import React, { createContext, useContext, useRef, useEffect } from "react";


interface MapLayerContextType {
  locationLayer: React.MutableRefObject<L.LayerGroup | null>;
  reportLayer: React.MutableRefObject<L.LayerGroup | null>;
  weatherLayer: React.MutableRefObject<L.LayerGroup | null>;
}

const MapLayerContext = createContext<MapLayerContextType | undefined>(
  undefined
);

export const MapLayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const locationLayer = useRef<L.LayerGroup | null>(null);
  const reportLayer = useRef<L.LayerGroup | null>(null);
  const weatherLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        locationLayer.current = L.layerGroup();
        reportLayer.current = L.layerGroup();
        weatherLayer.current = L.layerGroup();
      });
    }
  }, []);

  return (
    <MapLayerContext.Provider value={{ locationLayer, reportLayer, weatherLayer }}>
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