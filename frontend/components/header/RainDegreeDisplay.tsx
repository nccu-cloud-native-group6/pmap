import React from "react";
import { Chip } from "@nextui-org/react";

interface RainDegreeDisplayProps {
  rainDegree: number;
}

export const rainDescriptions = [
  "大晴天 ☀️",
  "保濕噴霧雨 🌫️",
  "小雨 🌦️",
  "中雨 🌧️",
  "大雨 ⛈️",
  "超級大雨 🌊",
];

const RainDegreeDisplay: React.FC<RainDegreeDisplayProps> = ({ rainDegree }) => {
  const getGradientColor = (degree: number) => {
    switch (degree) {
      case 0:
        return "linear-gradient(90deg, #FFC107, #FFE082)"; // Sunny // Sunny
      case 1:
        return "linear-gradient(90deg, #64B5F6, #BBDEFB)"; // Mist Rain // Mist Rain
      case 2:
        return "linear-gradient(90deg, #4FC3F7, #81D4FA)"; // Light Rain // Light Rain
      case 3:
        return "linear-gradient(90deg, #29B6F6, #4FC3F7)"; // Moderate Rain // Moderate Rain
      case 4:
        return "linear-gradient(90deg, #0288D1, #039BE5)"; // Heavy Rain // Heavy Rain
      case 5:
        return "linear-gradient(90deg, #303F9F, #3F51B5)"; // Torrential Rain // Torrential Rain
      default:
        return "linear-gradient(90deg, #B0BEC5, #CFD8DC)"; // Default (unknown degree) // Default (unknown degree)
    }
  };

  return (
    <Chip
      size="lg"
      style={{
        background: getGradientColor(rainDegree),
        color: "#fff",
        fontWeight: "bold",
      }}
    >
      {rainDescriptions[rainDegree] || "Unknown"}
    </Chip>
  );
};

export default RainDegreeDisplay;
