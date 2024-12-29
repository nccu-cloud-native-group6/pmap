import React, { useState } from "react";
import Megaphone from "./megaphone";
import Geocoder from "./geocoder";
import Login from "../login";
import ThemeSwitch from "../themeSwitch";
import HeaderBookmark from "../bookmark";
import Notification from "../notification";
import Location from "./location";
import { useTheme } from "../../contexts/ThemeContext";
import RainDegreeDisplay from "./RainDegreeDisplay";

interface HeaderProps {
  mapRef: React.MutableRefObject<any>;
  onTogglePanel: () => void;
}

const Header: React.FC<HeaderProps> = ({ mapRef, onTogglePanel }) => {
  const { isDark, toggleTheme } = useTheme();
  const [rainDegree, setRainDegree] = useState<number | null>(null); // 用於存儲雨量等級

  return (
    <header className="p-4 flex flex-row justify-end space-x-6 items-center">
      <div className="hidden sm:block">
        {rainDegree !== null && (
          <RainDegreeDisplay rainDegree={Number(rainDegree.toFixed(0))} />
        )}
      </div>
      <div className="hidden sm:block">
        <Geocoder mapRef={mapRef} />
      </div>
      <Megaphone /> {/* 使用封裝的 Megaphone 組件 */}
      <ThemeSwitch isSelected={isDark} onChange={toggleTheme} />
      <div className="hidden sm:block">
        <HeaderBookmark onTogglePanel={onTogglePanel} />
      </div>
      <Notification />
      <Location mapRef={mapRef} onWeatherIdFetch={setRainDegree} />
      <Login />
    </header>
  );
};

export default Header;
