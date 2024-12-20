'use client';

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { usePageController } from "../../hooks/usePageController";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface GeocoderProps {
  placeholder?: string;
}

const Geocoder: React.FC<GeocoderProps> = ({ placeholder = "輸入地址或地名" }) => {
  const geocoderContainerRef = useRef<HTMLDivElement | null>(null);
  const geocoderInstanceRef = useRef<any>(null);
  const { mapRef, handleZoomIn } = usePageController(); // 解構 mapRef 和 handleZoomIn

  useEffect(() => {
    if (geocoderContainerRef.current && !geocoderInstanceRef.current) {
      const geocoder = new MapboxGeocoder({
        accessToken: MAPBOX_API_KEY || "",
        placeholder,
        marker: false,
        mapboxgl: mapboxgl,
      });

      geocoder.addTo(geocoderContainerRef.current);
      geocoderInstanceRef.current = geocoder;

      geocoder.on("result", (event: any) => {
        const result = event.result;
        if (result?.geometry?.coordinates) {
          const [lng, lat] = result.geometry.coordinates;

          // 等待 mapRef 初始化
          if (mapRef.current) {
            handleZoomIn({ lat, lng });
            console.log("Zoomed to location:", { lat, lng });
          } else {
            console.warn("Map instance is not initialized yet.");
          }
        }
      });

      return () => {
        geocoderInstanceRef.current = null;
        if (geocoderContainerRef.current) {
          geocoderContainerRef.current.innerHTML = "";
        }
        geocoder.clear();
      };
    }
  }, [handleZoomIn, mapRef]);

  useEffect(() => {
    // 檢查 mapRef 是否初始化成功
    if (!mapRef.current) {
      console.warn("Waiting for map instance to initialize...");
    }
  }, [mapRef]);

  return <div ref={geocoderContainerRef} className="geocoder-container" />;
};

export default Geocoder;
