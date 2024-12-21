import axios from "axios";
import * as turf from "@turf/turf";
import L from "leaflet";
import getColor from "./getColor";

/**
 * Adds a hex grid to the provided map instance.
 * Dynamically updates the grid colors when the theme changes.
 *
 * @param map - The Leaflet map instance
 * @param isDark - Boolean to determine if the theme is dark
 * @param layerGroup - A Leaflet LayerGroup to manage the grid layers
 * @param hoverEnabled - Boolean to enable or disable hover behavior
 */
export const addHexGrid = async (
  map: L.Map,
  isDark: boolean,
  layerGroup: L.LayerGroup,
  hoverEnabled: boolean
): Promise<void> => {
  try {
    // 清空現有的圖層
    layerGroup.clearLayers();

    // 發送 API 請求
    const response = await axios.get("/api/weather", {
      params: {
        lng: 24.9914,
        lat: 121.5667,
        radius: 99999,
      },
    });

    const rainGrid = response.data.data.rainGrid;
    if (!rainGrid || !rainGrid.hexGrid) {
      throw new Error(
        "Invalid response structure: rainGrid or hexGrid is undefined"
      );
    }

    const { cellSide, bbox, options } = rainGrid.hexGrid;
    const polyginIdToPreperties = rainGrid.polyginIdToPreperties;

    const propertiesMap = polyginIdToPreperties.reduce(
      (acc: Record<string, { avgRainDegree: number }>, obj: Record<string, { avgRainDegree: number }>) => {
        const [id, data] = Object.entries(obj)[0];
        acc[id] = data;
        return acc;
      },
      {} as Record<string, { avgRainDegree: number }>
    );

    const hexGrid = turf.hexGrid(bbox, cellSide, options);
    hexGrid.features.forEach((feature, index) => {
      const coords: L.LatLngTuple[] = (
        feature.geometry.coordinates[0] as [number, number][]
      ).map(([lng, lat]) => [lat, lng] as L.LatLngTuple);

      const id = `${index + 1}`;
      const hexValue = propertiesMap[id]?.avgRainDegree || 0;

      const polygon = L.polygon(coords, {
        color: getColor(hexValue, isDark), // 使用 getColor 根據主題選擇顏色
        weight: 1,
        fillOpacity: 0.5,
      });

      polygon.bindPopup(`Hex ID: ${id}<br>Avg Rain Degree: ${hexValue}`);

      // 如果 hoverEnabled，添加 hover 行為
      if (hoverEnabled) {
        polygon.on("mouseover", () => {
          polygon.setStyle({
            fillColor: "#ff0000", // 高亮顏色
            fillOpacity: 0.7,
          });
          console.log(`Hovered Hex ID: ${id}, Avg Rain Degree: ${hexValue}`);
        });

        polygon.on("mouseout", () => {
          polygon.setStyle({
            fillColor: getColor(hexValue, isDark), // 恢復原始顏色
            fillOpacity: 0.5,
          });
        });
      }

      layerGroup.addLayer(polygon); // 添加到圖層組
    });

    // 將圖層組添加到地圖
    layerGroup.addTo(map);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
};
