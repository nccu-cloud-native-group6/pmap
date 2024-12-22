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
function getNeighborIds(
  id: number,
  depth: number,
  hexesPerRow: number
): number[] {
  const neighbors = new Set<number>();
  const directions = [
    -hexesPerRow, // 正上
    -hexesPerRow - 1, // 左上
    -1, // 左
    +1, // 右
    +hexesPerRow + 1, // 右下
    +hexesPerRow, // 正下
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
  depth: number = 5, // Highlighting depth
  radius: number = 5000, // Highlight radius in meters
  hexesPerRow: number = 30, // Number of hexes per row
  selectedPolygonIds: string[], // Array of selected polygon IDs
  setSelectedPolygonIds: (ids: string[]) => void // Callback to update the selected IDs
): Promise<void> => {
  try {
    layerGroup.clearLayers(); // Clear previous layers

    const response = await axios.get("/api/weather", {
      params: { lng: 24.9914, lat: 121.5667, radius: 99999 },
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

    let currentSelectedIds = [...selectedPolygonIds];

    const updateStyles = () => {
      Object.keys(hexesById).forEach((polygonId) => {
        const polygonElement = hexesById[polygonId];
        const hexValue = propertiesMap[polygonId]?.avgRainDegree || 0;

        if (polygonElement) {
          polygonElement.setStyle({
            fillColor: currentSelectedIds.includes(polygonId)
              ? polygonId === currentSelectedIds[0]
                ? "#ff6666" // 選中的主色
                : "#ff6666" // 鄰居選中色
              : getColor(hexValue, isDark), // 根據主題計算顏色
            fillOpacity: currentSelectedIds.includes(polygonId) ? 0.8 : 0.5,
          });
        }
      });
    };

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

      if (hoverEnabled) {
        updateStyles();
        polygon.on("mouseover", () => {
          const currentId = parseInt(id, 10);
          const neighborIds = getNeighborIds(currentId, depth, hexesPerRow);

          const center = polygon.getBounds().getCenter();
          const centerCoords: [number, number] = [center.lng, center.lat];

          const circle = turf.circle(centerCoords, radius / 1000, {
            units: "kilometers",
          });

          neighborIds.forEach((neighborId) => {
            const neighborPolygon = hexesById[neighborId.toString()];
            if (neighborPolygon) {
              const neighborCenter = neighborPolygon.getBounds().getCenter();
              const neighborPoint = turf.point([
                neighborCenter.lng,
                neighborCenter.lat,
              ]);

              if (turf.booleanIntersects(neighborPoint, circle)) {
                neighborPolygon.setStyle({
                  fillColor: currentSelectedIds.includes(neighborId.toString())
                    ? "#ff6666"
                    : "#0000ff",
                  fillOpacity: 0.6,
                });
              }
            }
          });

          polygon.setStyle({
            fillColor: currentSelectedIds.includes(id) ? "#ff0000" : "#FFFFFF",
            fillOpacity: 0.7,
          });
        });

        polygon.on("mouseout", () => {
          updateStyles();
        });

        polygon.on("click", () => {
          currentSelectedIds = [];
          const center = polygon.getBounds().getCenter();
          const centerCoords: [number, number] = [center.lng, center.lat];
          const circle = turf.circle(centerCoords, radius / 1000, {
            units: "kilometers",
          });
          if (!currentSelectedIds.includes(id)) {
            const neighborIds = getNeighborIds(
              parseInt(id, 10),
              depth,
              hexesPerRow
            );

            neighborIds.forEach((neighborId) => {
              const neighborPolygon = hexesById[neighborId.toString()];
              if (neighborPolygon) {
                const neighborCenter = neighborPolygon.getBounds().getCenter();
                const neighborPoint = turf.point([
                  neighborCenter.lng,
                  neighborCenter.lat,
                ]);
                console.log(neighborPoint);
                if (
                  neighborPolygon &&
                  turf.booleanIntersects(neighborPoint, circle)
                ) {
                  currentSelectedIds.push(neighborId.toString());
                }
              }
            });
            currentSelectedIds.push(id);
          }

          setSelectedPolygonIds(currentSelectedIds);
          updateStyles();

          Object.keys(hexesById).forEach((polygonId) => {
            const polygonElement = hexesById[polygonId];
            if (polygonElement) {
              polygonElement.setStyle({
                fillColor: currentSelectedIds.includes(polygonId)
                  ? polygonId === id
                    ? "#ff0000"
                    : "#ff6666"
                  : getColor(
                      propertiesMap[polygonId]?.avgRainDegree || 0,
                      isDark
                    ),
                fillOpacity: currentSelectedIds.includes(polygonId) ? 0.8 : 0.5,
              });
            }
          });
        });
      }
    });

    layerGroup.addTo(map);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
};
