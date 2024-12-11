"use client";

import React, { useState, useEffect } from "react";
import MapWrapper from "../components/map";
import Login from "../components/login";
import Notification from "../components/notification";
import BackdropModal from "../components/modal";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    // 頁面載入時自動開啟 Modal
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    console.log("Modal closed");
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 flex flex-row justify-end space-x-6">
        <Notification />
        <Login />
      </div>
      <div className="flex-grow z-0">
        <MapWrapper />
      </div>
      <BackdropModal
        backdrop="blur"
        isOpen={isModalOpen}   // 使用狀態控制 Modal 的開關
        onClose={handleCloseModal}
      />
    </div>
  );
}
