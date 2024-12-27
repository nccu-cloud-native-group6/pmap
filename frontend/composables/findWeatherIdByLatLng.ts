import * as turf from "@turf/turf";
import axios from "axios";

/**
 * 根據經緯度查找對應的 weatherLayer ID
 * @param lat Latitude of the point
 * @param lng Longitude of the point
 * @returns 匹配的多邊形 ID，如果沒有找到則返回 null
 */
export const findWeatherIdByLatLng = async (
  lat: number,
  lng: number
): Promise<string | null> => {
  try {
    // 獲取天氣數據
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/weather`, {
        params: { lat: 24.9914, lng: 121.5667, radius: 99999 },
    });

    const rainGrid = response.data.data.rainGrid;
    if (!rainGrid || !rainGrid.hexGrid) {
      throw new Error("Invalid response structure: rainGrid or hexGrid is undefined");
    }

    const { cellSide, bbox, options } = rainGrid.hexGrid;

    // 使用 turf.js 生成 HexGrid
    const hexGrid = turf.hexGrid(bbox, cellSide, options);

    // 將經緯度轉換為目標點
    const targetPoint = turf.point([lng, lat]);

    let matchedId: string | null = null;

    // 遍歷 HexGrid，查找目標點是否在多邊形內
    hexGrid.features.forEach((feature,index) => {
        const id = `${index + 1}`;
        feature.properties = { id };
      if (turf.booleanPointInPolygon(targetPoint, feature)) {
        matchedId = feature.properties?.id || null; // 匹配的多邊形 ID
      }
    });

    console.log("Matched ID:", matchedId);

    return matchedId;
  } catch (error) {
    console.error("Error finding weather ID:", error);
    return null;
  }
};
