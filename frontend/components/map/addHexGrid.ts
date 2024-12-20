import axios from "axios";
import * as turf from "@turf/turf";
import L from "leaflet";
import getColor from "./getColor";

/**
 * Adds a hex grid to the provided map instance.
 * Fetches data from the API and renders hexagons on the map based on the data.
 * 
 * @param map - The Leaflet map instance
 */
export const addHexGrid = async (map: L.Map): Promise<void> => {
  try {
    // 發送 API 請求
    const response = await axios.get("/api/weather", {
      params: {
        lng: 24.9914,
        lat: 121.5667,
        radius: 99999,
      },
    });

    // 提取數據並檢查結構
    const rainGrid = response.data.data.rainGrid;
    if (!rainGrid || !rainGrid.hexGrid) {
      throw new Error(
        "Invalid response structure: rainGrid or hexGrid is undefined"
      );
    }

    const { cellSide, bbox, options } = rainGrid.hexGrid;
    const polyginIdToPreperties = rainGrid.polyginIdToPreperties;

    // 將 `polyginIdToPreperties` 轉換為便於快速查詢的結構
    const propertiesMap = polyginIdToPreperties.reduce(
      (acc: Record<string, { avgRainDegree: number }>, obj: Record<string, { avgRainDegree: number }>) => {
        const [id, data] = Object.entries(obj)[0];
        acc[id] = data;
        return acc;
      },
      {} as Record<string, { avgRainDegree: number }>
    );

    // 使用 Turf.js 生成六邊形網格
    const hexGrid = turf.hexGrid(bbox, cellSide, options);
    hexGrid.features.forEach((feature, index) => {
      const coords: L.LatLngTuple[] = (
        feature.geometry.coordinates[0] as [number, number][]
      ).map(([lng, lat]) => [lat, lng] as L.LatLngTuple);

      // 根據索引匹配對應的值
      const id = `${index + 1}`; // Turf.js 的 feature 沒有內建 ID，用索引作為對應
      const hexValue = propertiesMap[id]?.avgRainDegree || 0;

      // 創建 Leaflet 的多邊形圖層，使用 getColor 渲染顏色
      const polygon = L.polygon(coords, {
        color: getColor(hexValue), // 使用 getColor 函數根據值渲染顏色
        weight: 1,
        fillOpacity: 0.2, // 顯示更強的填充色
      });

      // 添加彈出窗口顯示值
      polygon.bindPopup(`Hex ID: ${id}<br>Avg Rain Degree: ${hexValue}`);

      // 在地圖上顯示六邊形
      polygon.addTo(map);
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
};
