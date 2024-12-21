"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface GeocoderProps {
  mapRef: React.MutableRefObject<any>;
  placeholder?: string;
}

const Geocoder: React.FC<GeocoderProps> = ({
  mapRef,
  placeholder = "輸入地址或地名",
}) => {
  const geocoderContainerRef = useRef<HTMLDivElement | null>(null);
  const geocoderInitialized = useRef(false); // Track initialization

  useEffect(() => {
    if (!geocoderInitialized.current) {
      // Prevent duplicate initialization
      const geocoder = new MapboxGeocoder({
        accessToken: MAPBOX_API_KEY || "",
        placeholder,
        marker: false,
        mapboxgl: mapboxgl,
      });

      geocoder.addTo(geocoderContainerRef.current!);

      geocoder.on("result", (event: any) => {
        const result = event.result;
        if (result?.geometry?.coordinates) {
          const [lng, lat] = result.geometry.coordinates;
          mapRef.current.flyTo([lat, lng], 17);        
        }
      });

      geocoderInitialized.current = true; // Mark as initialized
    }
  }, [mapRef, placeholder]);

  return <div ref={geocoderContainerRef} className="geocoder-container" />;
};

export default Geocoder;
