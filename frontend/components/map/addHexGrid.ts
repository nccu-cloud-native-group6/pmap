import axios from "axios";
import * as turf from "@turf/turf";
import L from "leaflet";
import getColor from "./getColor";

/**
 * 計算多層鄰居的 Hex IDs
 * @param id 當前 Hex 的 ID
 * @param depth 高亮層數
 * @param hexesPerRow 每行 Hex 的數量
 * @returns 鄰居 Hex 的 ID 列表
 */
function getNeighborIds(id: number, depth: number, hexesPerRow: number): number[] {
  const neighbors = new Set<number>();
  const directions = [
    -hexesPerRow,        // 正上
    -hexesPerRow - 1,    // 左上
    -1,                  // 左
    +1,                  // 右
    +hexesPerRow + 1,    // 右下
    +hexesPerRow,        // 正下
  ];

  let currentLayer = new Set<number>([id]);

  for (let d = 1; d <= depth; d++) {
    const nextLayer = new Set<number>();

    currentLayer.forEach((hexId) => {
      directions.forEach((offset) => {
        const neighborId = hexId + offset;
        if (!neighbors.has(neighborId)) {
          nextLayer.add(neighborId);
        }
      });
    });

    nextLayer.forEach((hexId) => neighbors.add(hexId));
    currentLayer = nextLayer;
  }

  return Array.from(neighbors);
}

export const addHexGrid = async (
  map: L.Map,
  isDark: boolean,
  layerGroup: L.LayerGroup,
  hoverEnabled: boolean,
  depth: number = 5, // 高亮層數
  radius: number = 5000, // 高亮範圍（米）
  hexesPerRow: number = 30 // 每行 Hex 的數量
): Promise<void> => {
  try {
    layerGroup.clearLayers();

    const response = await axios.get("/api/weather", {
      params: { lng: 24.9914, lat: 121.5667, radius: 99999 },
    });

    const rainGrid = response.data.data.rainGrid;
    if (!rainGrid || !rainGrid.hexGrid) {
      throw new Error("Invalid response structure: rainGrid or hexGrid is undefined");
    }

    const { cellSide, bbox, options } = rainGrid.hexGrid;
    const polyginIdToPreperties = rainGrid.polyginIdToPreperties;

    const propertiesMap = polyginIdToPreperties.reduce(
      (
        acc: Record<string, { avgRainDegree: number }>,
        obj: Record<string, { avgRainDegree: number }>
      ) => {
        const [id, data] = Object.entries(obj)[0];
        acc[id] = data;
        return acc;
      },
      {}
    );

    const hexGrid = turf.hexGrid(bbox, cellSide, options);

    const hexesById: Record<string, L.Polygon> = {};
    hexGrid.features.forEach((feature, index) => {
      const id = `${index + 1}`;
      feature.properties = { id };

      const coords: L.LatLngTuple[] = (
        feature.geometry.coordinates[0] as [number, number][]
      ).map(([lng, lat]) => [lat, lng]);

      const hexValue = propertiesMap[id]?.avgRainDegree || 0;

      const polygon = L.polygon(coords, {
        color: getColor(hexValue, isDark),
        weight: 1,
        fillOpacity: 0.5,
      });

      polygon.bindPopup(`Hex ID: ${id}<br>Avg Rain Degree: ${hexValue}`);

      hexesById[id] = polygon;

      layerGroup.addLayer(polygon);
    });

    // Hover 行為
    if (hoverEnabled) {
      Object.entries(hexesById).forEach(([id, polygon]) => {
        polygon.on("mouseover", () => {
          const currentId = parseInt(id, 10);
          const neighborIds = getNeighborIds(currentId, depth, hexesPerRow);

          const center = polygon.getBounds().getCenter();
          const centerCoords: [number, number] = [center.lng, center.lat];

          const circle = turf.circle(centerCoords, radius / 1000, { units: "kilometers" });

          // Highlight neighbors
          neighborIds.forEach((neighborId) => {
            const neighborPolygon = hexesById[neighborId.toString()];
            if (neighborPolygon) {
              const neighborCenter = neighborPolygon.getBounds().getCenter();
              const neighborPoint = turf.point([neighborCenter.lng, neighborCenter.lat]);

              if (turf.booleanIntersects(neighborPoint, circle)) {
                neighborPolygon.setStyle({
                  fillColor: "#0000ff",
                  fillOpacity: 0.6,
                });
              }
            }
          });
          // if depth is 0, highlight the current hexagon
          if (depth === 0) {
            polygon.setStyle({ fillColor: "#ff0000", fillOpacity: 0.6 });
          } else {

          polygon.setStyle({ fillColor: "#FFFFFF", fillOpacity: 0.7 });
          }
        });

        polygon.on("mouseout", () => {
          const hexValue = propertiesMap[id]?.avgRainDegree || 0;
          polygon.setStyle({
            fillColor: getColor(hexValue, isDark),
            fillOpacity: 0.5,
          });

          const currentId = parseInt(id, 10);
          const neighborIds = getNeighborIds(currentId, depth, hexesPerRow);

          neighborIds.forEach((neighborId) => {
            const neighborPolygon = hexesById[neighborId.toString()];
            if (neighborPolygon) {
              const neighborHexValue =
                propertiesMap[neighborId.toString()]?.avgRainDegree || 0;
              neighborPolygon.setStyle({
                fillColor: getColor(neighborHexValue, isDark),
                fillOpacity: 0.5,
              });
            }
          });
        });
      });
    }

    layerGroup.addTo(map);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
};
