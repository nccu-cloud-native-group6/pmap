import React from "react";
import Megaphone from "./megaphone";
import Geocoder from "./geocoder";
import Login from "../login";
import ThemeSwitch from "../themeSwitch";
import HeaderBookmark from "../bookmark";
import Notification from "../notification";
import { useTheme } from "../../contexts/ThemeContext";

interface HeaderProps {
  mapRef: React.MutableRefObject<any>;
  onTogglePanel: () => void;
}

const Header: React.FC<HeaderProps> = ({ mapRef, onTogglePanel }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="p-4 flex flex-row justify-end space-x-6 items-center">
      <Geocoder mapRef={mapRef} />
      <Megaphone /> {/* 使用封裝的 Megaphone 組件 */}
      <ThemeSwitch isSelected={isDark} onChange={toggleTheme} />
      <HeaderBookmark onTogglePanel={onTogglePanel} />
      <Notification />
      <Login />
    </header>
  );
};

export default Header;
