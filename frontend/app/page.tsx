"use client";

import React, { useState } from "react";
import Header from "../components/header";
import MapWrapper from "../components/map";
import BackdropModal from "../components/modal";
import { usePageController } from "../hooks/usePageController";

export default function Page() {
  const { mapRef, modalState, handleSubmitData, handleCloseModal } = usePageController();
  const [isMapReady, setIsMapReady] = useState(false); // 用於追蹤地圖是否初始化
  const [isPanelOpen, setIsPanelOpen] = useState(false); // Sliding Panel 狀態

  const handleMapLoad = (mapInstance: any) => {
    mapRef.current = mapInstance; // 設置地圖實例到 ref
    setIsMapReady(true); // 地圖加載完成後更新狀態
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      {isMapReady ? (
        <Header mapRef={mapRef} onTogglePanel={() => setIsPanelOpen(!isPanelOpen)} />
      ) : (
        <div className="h-16" />
      )}

      {/* 主內容區域 */}
      <div className="flex flex-1">
        {/* 地圖區域 */}
        <div className={`flex-grow transition-all ${isPanelOpen ? "w-2/3" : "w-full"}`}>
          <MapWrapper onLoad={handleMapLoad} /> {/* 地圖初始化回調 */}
        </div>

        {/* Sliding Panel */}
        <div
          className={`h-full shadow-lg border-l transition-transform ${
            isPanelOpen ? "translate-x-0 w-1/3" : "translate-x-full w-0"
          }`}
        >
          {isPanelOpen && (
            <div className="p-6">
              <button
                onClick={() => setIsPanelOpen(false)}
                className="absolute top-4 right-4 text-gray-500"
              >
                Close
              </button>
              <h2 className="text-lg font-bold">Your Bookmarks</h2>
              <ul className="mt-4 space-y-2">
                <li className="p-2 bg-gray-100 rounded">Region 1</li>
                <li className="p-2 bg-gray-100 rounded">Region 2</li>
                <li className="p-2 bg-gray-100 rounded">Region 3</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <div className="z-60">
        <BackdropModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitData}
        />
      </div>
    </div>
  );
}
