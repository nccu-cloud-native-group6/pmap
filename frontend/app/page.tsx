"use client";

import React from "react";
import { usePageController } from "../hooks/usePageController";
import MapWrapper from "../components/map";
import Login from "../components/login";
import Notification from "../components/notification";
import BackdropModal from "../components/modal";

export default function Page() {
  const { mapRef, modalState, handleSubmitData, handleCloseModal } = usePageController();

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 flex flex-row justify-end space-x-6 align-center">
        <Notification />
        <Login />
      </div>
      <div className="flex-grow flex items-end">
        <MapWrapper />
      </div>
        <BackdropModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitData}
        />
    </div>
  );
}
