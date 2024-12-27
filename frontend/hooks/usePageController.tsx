"use client";

import { useRef, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import dynamic from "next/dynamic";
import { useModal } from "../contexts/ModalContext";
import { Report } from "../types/report";
import { useUserAvatar } from "../composables/useUserAvatar";
import ReportPopup from "../components/popup/ReportPopup";
import { useMapLayer } from "../contexts/MapLayerContext";


// 動態載入地圖組件，避免 SSR 問題
const Map = dynamic(() => import("../components/map"), {
  ssr: false, // 禁用伺服器端渲染
});

export const usePageController = () => {
  const mapRef = useRef<any>(null); // 地圖引用
  const { state: modalState, dispatch: modalDispatch } = useModal();
  const { getUserAvatarHTML } = useUserAvatar();
  const [leaflet, setLeaflet] = useState<any>(null);
  const { reportLayer } = useMapLayer();

  useEffect(() => {
    // 僅在客戶端動態載入 Leaflet
    const loadLeaflet = async () => {
      const L = (await import("leaflet")).default;
      setLeaflet(L);
    };
    loadLeaflet();
  }, []);

  const handleSubmitData = async (report: Report) => {
    
    try {
      // 創建 FormData
      const formData = new FormData();

      // 將圖片加入 FormData
      if (report.photoUrl) {
        const response = await fetch(report.photoUrl);
        const blob = await response.blob();
        formData.append("reportImg", blob, "image.jpg");
      }

      // 將其他資料加入 FormData
      formData.append(
        "data",
        JSON.stringify({
          location: {
            latlng: {
              lat: report.location.lat,
              lng: report.location.lng,
            },
            address: "Unknown address",
            polygonId: 200,
          },
          rainDegree: report.rainDegree,
          comment: report.comment,
        })
      );

      // 發送請求
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/reports`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${report.user.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit report.");
      }

      const result = await response.json();
      console.log("Report submitted successfully via API:", result);

      // 更新地圖標記
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
        const popupContainer = document.createElement("div");
        popupContainer.style.width = "250px"; // 設置固定寬度，與 ReportPopup 的最大寬度一致
        popupContainer.style.overflow = "hidden"; // 避免內容超出邊界
        popupContainer.style.borderRadius = "8px"; // 增加圓角
        popupContainer.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)"; // 添加陰影效果

        const root = createRoot(popupContainer);

        // 使用 React 渲染彈窗內容
        root.render(
          <ReportPopup
            userName={report.user.name}
            rainDegree={report.rainDegree}
            comment={report.comment}
            photoUrl={report.photoUrl}
          />
        );

        const reportMarker = leaflet
          .marker([report.location.lat, report.location.lng], {
            icon: avatarIcon,
          })
          .bindPopup(popupContainer, {
            offset: [0, -40],
          })
          //.addTo(mapRef.current)
          .openPopup();

          // 將標記添加到報告圖層
    if (reportLayer.current) {
      reportMarker.addTo(reportLayer.current);
    }

    // 確保圖層已經添加到地圖
    if (mapRef.current && !mapRef.current.hasLayer(reportLayer.current)) {
      if (reportLayer.current) {
        reportLayer.current.addTo(mapRef.current);
      }
    }

        mapRef.current.flyTo([report.location.lat, report.location.lng], 17);

        console.log("Marker added to map:", reportMarker);

        return reportMarker; // 返回生成的標記供進一步操作
      }
    } catch (error) {
      console.error("Error submitting report via API:", error);
      throw error; // 將錯誤向上拋出以便進一步處理
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
