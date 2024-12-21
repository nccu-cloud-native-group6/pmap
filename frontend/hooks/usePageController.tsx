"use client";

import { useRef, useEffect } from "react";
import { useModal } from "../contexts/ModalContext";
import { Report } from "../types/report";

// 動態導入 Leaflet
let L: any;
if (typeof window !== "undefined") {
  L = require("leaflet");
}

// 用戶的照片和位置接口
interface UserLocation {
  lat: number;
  lng: number;
  photoUrl: string;
  userName: string;
}

export const usePageController = () => {
  const mapRef = useRef<any>(null); // 地圖參考
  const { state: modalState, dispatch: modalDispatch } = useModal();

  // 在地圖上顯示用戶信息
  const addUserLocation = (map: any, user: UserLocation) => {
    const userIcon = L.divIcon({
      className: "custom-user-icon",
      html: `
        <div style="position: relative; text-align: center;">
          <img 
            src="${user.photoUrl}" 
            alt="${user.userName}" 
            style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid white;" 
          />
        </div>
      `,
    });

    const marker = L.marker([user.lat, user.lng], { icon: userIcon }).addTo(map);

    return { marker };
  };

  const handleSubmitData = (report: Report) => {
    if (
      typeof window !== "undefined" &&
      report.location.lat &&
      report.location.lng &&
      mapRef.current
    ) {
      addUserLocation(mapRef.current, {
        lat: report.location.lat,
        lng: report.location.lng,
        photoUrl: report.user.image,
        userName: report.user.name,
      });

      mapRef.current.flyTo([report.location.lat, report.location.lng], 17);

      console.log("Report Submitted:", report);
      modalDispatch({ type: "CLOSE_MODAL" });
    }
  };

  const handleCloseModal = () => {
    modalDispatch({ type: "CLOSE_MODAL" });
  };

  useEffect(() => {
    if (mapRef.current) {
      console.log("Map reference initialized:", mapRef.current);
    }
  }, [mapRef]);

  return {
    mapRef,
    modalState,
    handleSubmitData,
    handleCloseModal,
  };
};
