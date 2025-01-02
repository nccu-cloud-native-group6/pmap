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
  lng: number,
  returnDegree: boolean = false
): Promise<string | null> => {
  returnDegree = returnDegree ?? false;
  try {
    // 獲取天氣數據
    const response = await axios.get(`https://pmap.nccucloud.store/api/weather`, {
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
        //console.log("Matched ID:", matchedId);
      }
    });

    if (returnDegree) {
      const polyginIdToPreperties = rainGrid.polyginIdToPreperties;
      //console.log("Polygin ID To Properties:",polyginIdToPreperties);
      // fine the degree of the matched polygon
      const oneDimensionalArray = polyginIdToPreperties.reduce((acc: any[], obj: Record<string, { avgRainDegree: number }>) => {
        // 遍歷每個物件的鍵值
        Object.entries(obj).forEach(([id, data]) => {
          acc.push({ id, ...data }); // 合併 id 和 data
        });
        return acc;
      }, []);
      //console.log("One Dimensional Array:",oneDimensionalArray);
      const matchedPolygon = matchedId ? oneDimensionalArray[matchedId-1].avgRainDegree : null;
      //console.log("Matched Polygon:",matchedId, matchedPolygon);
      return matchedPolygon;
    }

    //console.log("Matched ID:", matchedId);

    return matchedId;
  } catch (error) {
    console.error("Error finding weather ID:", error);
    return null;
  }
};
