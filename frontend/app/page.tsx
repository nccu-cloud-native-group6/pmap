import React from "react";
import MapWrapper from "../components/map";
import Login from "../components/login"; // 引入 Login 組件
import Notification from "../components/notification"; // 引入 Notification 組件

export default function Page() {
  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 flex flex-row justify-end space-x-6">
        <Notification />
        <Login />
      </div>
      <div className="flex-grow">
        <MapWrapper />
      </div>
    </div>
  );
}
