// addPointToMap.ts

import axios from "axios";
import * as turf from "@turf/turf";
import L from "leaflet";

/**
 * 在每個 Marker 被點擊時：
 * 1) 呼叫天氣 API 取得 hexGrid
 * 2) 遍歷 feature.properties.id
 * 3) 若 id 在 d.selectedPolygonsIds 中，就加到地圖
 *
 * 在 Marker popup 關閉時 (popupclose)：
 * - 移除先前加的多邊形
 */

export const addPointToMap = (
  data: any[],              // Marker 資料陣列
  subLayer: any,           // React.MutableRefObject<L.LayerGroup | null>
  leaflet: any             // Leaflet namespace
) => {
  data.forEach((d: any) => {

    // 1. 客製圖示
    const svgIcon = `
      <div style="
        width: 40px;
        height: 40px;
        background-color: #679E39;
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f0f0f0" width="20" height="20">
          <path fill-rule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clip-rule="evenodd" />
        </svg>
      </div>
    `;
    const customIcon = leaflet.divIcon({
      className: "custom-user-icon",
      html: svgIcon,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    // 2. 建立 Marker 並綁定 Popup
    const marker = leaflet
      .marker(d.location.latlng, { icon: customIcon })
      .bindPopup(d.nickName);

    // 用來暫存加到地圖上的 polygons，以便 popupclose 時移除
    (marker as any)._polygons = [];

    // === Marker 點擊：呼叫 API, 遍歷 hexGrid, 加到地圖 ===
    marker.on("click", async function () {
      try {
        // 2.1 呼叫天氣 API
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/weather`, {
          params: { lat: 24.9914, lng: 121.5667, radius: 99999 },
        });

        const rainGrid = response.data.data.rainGrid;
        if (!rainGrid || !rainGrid.hexGrid) {
          throw new Error("Invalid response structure: rainGrid or hexGrid is undefined");
        }

        const { cellSide, bbox, options } = rainGrid.hexGrid;
        const hexGrid = turf.hexGrid(bbox, cellSide, options);

        // 2.2 遍歷每個 feature, 若 id 在 d.selectedPolygonsIds 中 => 加到地圖
        hexGrid.features.forEach((feature, index) => {
          const id = index+1;
          feature.properties = { id };  

          // 檢查這個 id 是否在 d.selectedPolygonsIds 內
          if (d.selectedPolygonsIds && d.selectedPolygonsIds.includes(id)) {
            console.log("Adding polygon:", id);
            // 轉成 Leaflet Polygon
            const coords = (feature.geometry.coordinates[0] as [number, number][]).map(
              ([lng, lat]) => [lat, lng]
            );
            const polygon = leaflet.polygon(coords, {
              color: "red",
              weight: 2,
              fillColor: "red",
              fillOpacity: 0.3,
            });

            // 加到 subLayer
            polygon.addTo(subLayer.current);

            // 記錄到 marker 的屬性，以便後續移除
            (marker as any)._polygons.push(polygon);
          }
        });
      } catch (error) {
        console.error("Error fetching weather or adding polygons:", error);
      }
    });

    // === Marker popup 關閉: 移除先前加到地圖的 polygons ===
    marker.on("popupclose", function () {
      const storedPolygons = (marker as any)._polygons;
      if (storedPolygons && Array.isArray(storedPolygons)) {
        storedPolygons.forEach((pg: L.Polygon) => {
          subLayer.current?.removeLayer(pg);
        });
        (marker as any)._polygons = [];
      }
    });

    // 3. Marker 加到 subLayer
    marker.addTo(subLayer.current);
  });
};

// 刪除 Marker 邏輯保持不變
export const deletePointFromMap = (data: any[], subLayer: any) => {
  data.forEach((d: any) => {
    subLayer.current.eachLayer((layer: any) => {
      if (layer.getPopup?.()?.getContent() === d.nickName) {
        subLayer.current.removeLayer(layer);
      }
    });
  });
};
