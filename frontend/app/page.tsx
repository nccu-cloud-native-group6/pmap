"use client";

import React, { useState, useEffect, useRef } from "react";
import MapWrapper from "../components/map";
import Login from "../components/login";
import Notification from "../components/notification";
import BackdropModal from "../components/modal";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const mapRef = useRef<any>(null); // 將 map 實例存放在這裡

  useEffect(() => {
    // 頁面載入時自動開啟 Modal
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    console.log("Modal closed");
    setIsModalOpen(false);
  };

  const handleSubmitData = (data: { name: string; rainRating: number; location: {lat?: number; lng?: number} }) => {
    // 在這裡取得 modal 提交的資料
    // data 格式: { name, rainRating, location: {lat, lng} }
    // 如果有位置資料且 map 實例已取得
    if (data.location.lat && data.location.lng && mapRef.current) {
      // 調整地圖視野至使用者取得的位置
      mapRef.current.setView([data.location.lat, data.location.lng], 13); 
    }

    // 提交後關閉 modal
    handleCloseModal();
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 flex flex-row justify-end space-x-6">
        <Notification />
        <Login />
      </div>
      <div className="flex-grow z-0">
        {/** 將 map 實例透過 onMapLoad callback 傳回父元件 */}
        <MapWrapper onMapLoad={(mapInstance: any) => (mapRef.current = mapInstance)} />
      </div>
      <BackdropModal
        backdrop="blur"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitData} // 新增 onSubmit callback 傳遞至 Modal
      />
    </div>
  );
}
