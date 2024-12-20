"use client";

import React from "react";
import { usePageController } from "../hooks/usePageController";
import MapWrapper from "../components/map";
import BackdropModal from "../components/modal";
import Header from "../components/header";

export default function Page() {
  const { mapRef, modalState, handleSubmitData, handleCloseModal } =
    usePageController();

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-grow z-0">
        <MapWrapper onMapLoad={(mapInstance: any) => (mapRef.current = mapInstance)} />
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
