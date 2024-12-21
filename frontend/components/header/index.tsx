"use client";

import React from "react";
import Notification from "../notification";
import Login from "../login";
import ThemeSwitch from "../themeSwitch";
import Geocoder from "./geocoder";
import { useTheme } from "../../contexts/ThemeContext";

interface HeaderProps {
  mapRef: React.MutableRefObject<any>; // 地圖引用
}

export default function Header({ mapRef }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="p-4 flex flex-row justify-end space-x-6 align-center">
      <Geocoder mapRef={mapRef} /> {/* 傳遞 mapRef 給 Geocoder */}
      <ThemeSwitch isSelected={isDark} onChange={toggleTheme} />
      <Notification />
      <Login />
    </header>
  );
}
