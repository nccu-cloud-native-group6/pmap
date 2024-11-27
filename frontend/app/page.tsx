import React from "react";
import MapWrapper from "../components/mapWrapper";
import Login from "../components/login"; // 引入 Login 組件


export default function Page() {
  return (
    <div >
      <div className="p-4">
          <Login />
      </div>
      <MapWrapper />
    </div>
  );
}
