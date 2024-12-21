import { useRef, useEffect } from "react";
import { useModal } from "../contexts/ModalContext";
import { useMap } from "../contexts/MapContext";
import { Report } from "../types/report";

import L from "leaflet";

// 用戶的照片和位置
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
  const addUserLocation = (map: L.Map, user: UserLocation) => {
    // 自定義照片圖標
    const userIcon = L.divIcon({
      className: "custom-user-icon",
      html: `
        <img 
          src="${user.photoUrl}" 
          alt="${user.userName}" 
          style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid white;" 
        />
    `,
    });

    // 在圓形中心添加照片
    const marker = L.marker([user.lat, user.lng], { icon: userIcon }).addTo(
      map
    );

    // 返回組件以便後續控制
    return { marker };
  };

  const handleSubmitData = (report: Report) => {
    if (
      typeof window !== "undefined" &&
      report.location.lat &&
      report.location.lng &&
      mapRef.current
    ) {
      // 在地圖上顯示用戶位置和照片
      addUserLocation(mapRef.current, {
        lat: report.location.lat,
        lng: report.location.lng,
        photoUrl: report.user.image,
        userName: report.user.name,
      });

      // 更新地圖狀態
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
  }, [mapRef.current]);

  return {
    mapRef,
    modalState,
    handleSubmitData,
    handleCloseModal,
  };
};
