"use client";

import React, { useState } from "react";
import Header from "../components/header";
import MapWrapper from "../components/map";
import BackdropModal from "../components/modal";
import { usePageController } from "../hooks/usePageController";

export default function Page() {
  const { mapRef, modalState, handleSubmitData, handleCloseModal } = usePageController();
  const [isMapReady, setIsMapReady] = useState(false); // 用於追蹤地圖是否初始化

  const handleMapLoad = (mapInstance: any) => {
    mapRef.current = mapInstance; // 設置地圖實例到 ref
    setIsMapReady(true); // 地圖加載完成後更新狀態
  };

  return (
    <div className="flex flex-col h-screen">
      {isMapReady ? (
        <Header mapRef={mapRef} /> // 地圖初始化後渲染 Header
      ) : (
        <div className="h-16" />
      )}
      <div className="flex-grow z-0">
        <MapWrapper onLoad={handleMapLoad} /> {/* 傳遞回調 */}
      </div>
      <div className="z-50">
        <BackdropModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitData}
        />
      </div>
    </div>
  );
}
