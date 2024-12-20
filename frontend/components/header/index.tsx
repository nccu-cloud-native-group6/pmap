"use client";

import React from "react";
import Notification from "../notification";
import Login from "../login";
import ThemeSwitch from "../themeSwitch";
import { useTheme } from "../../contexts/ThemeContext";

export default function Header() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="p-4 flex flex-row justify-end space-x-6 align-center">
      <ThemeSwitch isSelected={isDark} onChange={toggleTheme} />
      <Notification />
      <Login />
    </header>
  );
}
