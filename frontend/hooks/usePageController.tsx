"use client";

import { useRef, useEffect } from "react";
import { useModal } from "../contexts/ModalContext";
import { Report } from "../types/report";
import { useUserAvatar } from "../composables/useUserAvatar"; // 引入 useUserAvatar

export const usePageController = () => {
  const mapRef = useRef<any>(null); // 地圖參考
  const { state: modalState, dispatch: modalDispatch } = useModal();
  const { addUserAvatar } = useUserAvatar(); // 使用 addUserAvatar

  const handleSubmitData = (report: Report) => {
    if (
      typeof window !== "undefined" &&
      report.location.lat &&
      report.location.lng &&
      mapRef.current
    ) {
      // 在地圖上顯示用戶位置和照片
      addUserAvatar(mapRef.current, {
        lat: report.location.lat,
        lng: report.location.lng,
        photoUrl: report.user.image, // 確保 photoUrl 不為 undefined
        userName: report.user.name,
      });

      // 更新地圖狀態並飛到目標位置
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
