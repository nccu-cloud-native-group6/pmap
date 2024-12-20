"use client";

import React from "react";
import Notification from "../notification";
import Login from "../login";
import ThemeSwitch from "../themeSwitch";
import Geocoder from "./geocoder";
import { useTheme } from "../../contexts/ThemeContext";
import { usePageController } from "../../hooks/usePageController";

export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const { mapRef } = usePageController();

  return (
    <header className="p-4 flex flex-row justify-end space-x-6 align-center">
      <Geocoder />
      <ThemeSwitch isSelected={isDark} onChange={toggleTheme} />
      <Notification />
      <Login />
    </header>
  );
}
