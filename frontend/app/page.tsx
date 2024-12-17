"use client";

import React from "react";
import { usePageController } from "../hooks/usePageController";
import MapWrapper from "../components/map";
import Login from "../components/login";
import Notification from "../components/notification";
import BackdropModal from "../components/modal";
import { User } from "next-auth";

const mockUser: User = {
  id: "12345",
  name: "John Doe",
  email: "johndoe@example.com",
  image: "https://example.com/avatar.png",
};

export default function Page() {
  const { mapRef, modalState, handleSubmitData, handleCloseModal } = usePageController();

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 flex flex-row justify-end space-x-6">
        <Notification />
        <Login />
      </div>
      <div className="flex-grow z-0">
        <MapWrapper onMapLoad={(mapInstance: any) => (mapRef.current = mapInstance)} />
      </div>
      <BackdropModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitData}
        user={mockUser}
      />
    </div>
  );
}