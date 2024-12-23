"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useModal } from "../contexts/ModalContext";
import { Report } from "../types/report";
import { useUserAvatar } from "../composables/useUserAvatar";

// 動態載入地圖組件，避免 SSR 問題
const Map = dynamic(() => import("../components/map"), {
  ssr: false, // 禁用伺服器端渲染
});

export const usePageController = () => {
  const mapRef = useRef<any>(null); // 地圖引用
  const { state: modalState, dispatch: modalDispatch } = useModal();
  const { getUserAvatarHTML } = useUserAvatar();
  const [leaflet, setLeaflet] = useState<any>(null);

  useEffect(() => {
    // 僅在客戶端動態載入 Leaflet
    const loadLeaflet = async () => {
      const L = (await import("leaflet")).default;
      setLeaflet(L);
    };
    loadLeaflet();
  }, []);

  const handleSubmitData = (report: Report) => {
    if (
      leaflet &&
      report.location.lat &&
      report.location.lng &&
      mapRef.current
    ) {
      const avatarHTML = getUserAvatarHTML({
        photoUrl: report.user.image,
        userName: report.user.name,
      });

      const avatarIcon = leaflet.divIcon({
        className: "custom-user-icon",
        html: avatarHTML,
        iconSize: [50, 50],
        iconAnchor: [25, 50],
      });

      const reportMarker = leaflet
        .marker([report.location.lat, report.location.lng], {
          icon: avatarIcon,
        })
        .addTo(mapRef.current);

      mapRef.current.flyTo([report.location.lat, report.location.lng], 17);

      console.log("Report Submitted:", report);
      modalDispatch({ type: "CLOSE_MODAL" });

      return reportMarker; // 返回生成的標記供進一步操作
    }
  };

  const handleCloseModal = () => {
    modalDispatch({ type: "CLOSE_MODAL" });
  };

  useEffect(() => {
    if (mapRef.current) {
      console.log("地圖引用初始化:", mapRef.current);
    }
  }, [mapRef]);

  return {
    mapRef,
    modalState,
    handleSubmitData,
    handleCloseModal,
  };
};
