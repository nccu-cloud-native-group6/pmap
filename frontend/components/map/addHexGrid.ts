import axios from "axios";
import * as turf from "@turf/turf";
import L from "leaflet";
import getColor from "./getColor";
import { Location } from "../../types/location";

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

export const polygonIdToLatLng: Map<number, Location> = new Map();


export const addHexGrid = async (
  map: L.Map,
  isDark: boolean,
  layerGroup: L.LayerGroup,
  hoverEnabled: boolean,
  depth: number = 5, // Highlighting depth
  radius: number = 5000, // Highlight radius in meters
  hexesPerRow: number = 30, // Number of hexes per row
  selectedPolygonIds: string[], // Array of selected polygon IDs
  setSelectedPolygonIds: (ids: string[]) => void, // Callback to update the selected IDs
  setLocation: (location: Location) => void, // Callback to set location lat lng
  weatherLayer: L.LayerGroup // Pass weatherLayer as a parameter
): Promise<void> => {

  try {
    if (weatherLayer) {
      weatherLayer.clearLayers(); // 清理之前的天氣網格
    } else {
      console.error("weatherLayer is not defined");
      return;
    }
    
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/weather`, {
      params: { lat: 24.9914, lng: 121.5667, radius: 99999 },
    });

    const rainGrid = response.data.data.rainGrid;
    if (!rainGrid || !rainGrid.hexGrid) {
      throw new Error(
        "Invalid response structure: rainGrid or hexGrid is undefined"
      );
    }

    const { cellSide, bbox, options } = rainGrid.hexGrid;
    const polyginIdToPreperties = rainGrid.polyginIdToPreperties;

    const propertiesMap = (Object.entries(polyginIdToPreperties) as [string, { avgRainDegree: number }][]).reduce(
      (
      acc: Record<string, { avgRainDegree: number }>,
      [id, data]: [string, { avgRainDegree: number }]
      ) => {
      acc[id] = data;
      return acc;
      },
      {}
    );

    const oneDimensionalArray = polyginIdToPreperties.reduce((acc: any[], obj: Record<string, { avgRainDegree: number }>) => {
      // 遍歷每個物件的鍵值
      Object.entries(obj).forEach(([id, data]) => {
        acc.push({ id, ...data }); // 合併 id 和 data
      });
      return acc;
    }, []);
    
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

    const markerLayerGroup = L.layerGroup().addTo(map);

    let currentMarker: L.Marker | null = null;

    hexGrid.features.forEach((feature, index) => {
      const id = `${index + 1}`;
      feature.properties = { id };

      const coords: L.LatLngTuple[] = (
        feature.geometry.coordinates[0] as [number, number][]
      ).map(([lng, lat]) => [lat, lng]);

      const hexValue = oneDimensionalArray[index]?.avgRainDegree || 0;

      const polygon = L.polygon(coords, {
        color: getColor(hexValue, isDark),
        weight: 1,
        fillOpacity: 0.5,
      });
      
      // Save the center of the polygon
      polygonIdToLatLng.set(Number(id), {
        lat: coords[0][0],
        lng: coords[0][1],
      });

      polygon.bindPopup(`Hex ID: ${id}<br>Avg Rain Degree: ${hexValue}`);

      hexesById[id] = polygon;

      weatherLayer.addLayer(polygon);

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

        polygon.on("click", (e) => { 

          // 更新位置
          setLocation({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
          });
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

    if (weatherLayer) {
      weatherLayer.addTo(map); // 確保 weatherLayer 被添加到地圖上
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
};
