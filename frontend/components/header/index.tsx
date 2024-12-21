"use client";

import React from "react";
import Notification from "../notification";
import Login from "../login";
import ThemeSwitch from "../themeSwitch";
import Geocoder from "./geocoder";
import HeaderBookmark from "../bookmark";
import { useTheme } from "../../contexts/ThemeContext";

interface HeaderProps {
  mapRef: React.MutableRefObject<any>; // 地圖引用
  onTogglePanel: () => void; // Panel 開關回調
}

export default function Header({ mapRef, onTogglePanel }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="p-4 flex flex-row justify-end space-x-6 items-center">
      <Geocoder mapRef={mapRef} />
      <ThemeSwitch isSelected={isDark} onChange={toggleTheme} />
      <HeaderBookmark onTogglePanel={onTogglePanel} />
      <Notification />
      <Login />
    </header>
  );
}