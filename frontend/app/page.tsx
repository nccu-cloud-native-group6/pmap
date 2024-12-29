"use client";

import React, { useState } from "react";
import Header from "../components/header";
import MapContainer from "../components/map";
import SlidingPanel from "../components/bookmark/SlidingPanel";
import BackdropModal from "../components/modal";
import { usePageController } from "../hooks/usePageController";

export default function Page() {
  const { mapRef, modalState, handleSubmitData, handleCloseModal } = usePageController();
  const [isMapReady, setIsMapReady] = useState(false); // 地圖是否初始化完成
  const [isPanelOpen, setIsPanelOpen] = useState(false); // Sliding Panel 狀態

  const handleMapLoad = (mapInstance: any) => {
    mapRef.current = mapInstance; // 設置地圖實例到 ref
    setIsMapReady(true); // 地圖加載完成後更新狀態
  };

  return (
    <div className="flex flex-col h-screen z-10">
      {/* Header */}
      <Header
        mapRef={mapRef}
        onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
      />

      {/* 主內容區域 */}
      <div className="flex flex-1 z-0">
        {/* Map */}
        <MapContainer
          onLoad={handleMapLoad}
        />
        <SlidingPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
        />
      </div>

      {/* Modal */}
      <BackdropModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitData}
      />
    </div>
  );
}