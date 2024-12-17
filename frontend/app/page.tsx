"use client";

import React from "react";
import { usePageController } from "../hooks/usePageController";
import MapWrapper from "../components/map";
import Login from "../components/login";
import Notification from "../components/notification";
import BackdropModal from "../components/modal";
import { useUser } from "../contexts/UserContext";

export default function Page() {
  const { mapRef, modalState, handleSubmitData, handleCloseModal } = usePageController();
  const user = useUser().user; // 從 UserContext 取得 user 資訊

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 flex flex-row justify-end space-x-6">
        <Notification />
        <Login />
      </div>
      <div className="flex-grow z-0">
        <MapWrapper onMapLoad={(mapInstance: any) => (mapRef.current = mapInstance)} />
      </div>
      {user && (
        <BackdropModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitData}
          user={user} // 傳遞 user 資訊
        />
      )}
    </div>
  );
}
