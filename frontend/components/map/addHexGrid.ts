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

/**
 * 保存 Hex ID 到其中心位置的映射
 */
export const polygonIdToLatLng: Map<number, Location> = new Map();

// 持久化 hexesById 和 propertiesMapRef 以及 eventHandlersRef
const hexesById: Record<string, L.Polygon> = {};
const propertiesMapRef: Record<string, { avgRainDegree: number }> = {};
const eventHandlersRef: Record<
  string,
  {
    mouseover: () => void;
    mouseout: () => void;
    click: (e: L.LeafletMouseEvent) => void;
  }
> = {};

/**
 * 綁定 Hover 事件
 */
const bindHoverEvents = (
  polygon: L.Polygon,
  id: string,
  depth: number,
  hexesPerRow: number,
  radius: number,
  isDark: boolean,
  currentSelectedIds: string[],
  setSelectedPolygonIds: (ids: string[]) => void,
  setLocation: (location: Location) => void,
  updateStyles: (ids: string[], isDark: boolean) => void
) => {
  const mouseoverHandler = () => {
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
        const neighborPoint = turf.point([neighborCenter.lng, neighborCenter.lat]);

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
  };

  const mouseoutHandler = () => {
    updateStyles(currentSelectedIds, isDark);
  };

  const clickHandler = (e: L.LeafletMouseEvent) => {
    // 更新位置
    setLocation({
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    });

    let updatedSelectedIds: string[] = [];

    const center = polygon.getBounds().getCenter();
    const centerCoords: [number, number] = [center.lng, center.lat];
    const circle = turf.circle(centerCoords, radius / 1000, {
      units: "kilometers",
    });

    const currentId = parseInt(id, 10);
    const neighborIds = getNeighborIds(currentId, depth, hexesPerRow);

    neighborIds.forEach((neighborId) => {
      const neighborPolygon = hexesById[neighborId.toString()];
      if (neighborPolygon) {
        const neighborCenter = neighborPolygon.getBounds().getCenter();
        const neighborPoint = turf.point([neighborCenter.lng, neighborCenter.lat]);
        if (turf.booleanIntersects(neighborPoint, circle)) {
          updatedSelectedIds.push(neighborId.toString());
        }
      }
    });
    updatedSelectedIds.push(id);

    setSelectedPolygonIds(updatedSelectedIds);
    updateStyles(updatedSelectedIds, isDark);
  };

  polygon.on("mouseover", mouseoverHandler);
  polygon.on("mouseout", mouseoutHandler);
  polygon.on("click", clickHandler);

  // 存儲事件處理器以便未來移除
  eventHandlersRef[id] = {
    mouseover: mouseoverHandler,
    mouseout: mouseoutHandler,
    click: clickHandler,
  };
};

/**
 * 解除綁定 Hover 事件
 */
const unbindHoverEvents = (polygon: L.Polygon, id: string) => {
  const handlers = eventHandlersRef[id];
  if (handlers) {
    polygon.off("mouseover", handlers.mouseover);
    polygon.off("mouseout", handlers.mouseout);
    polygon.off("click", handlers.click);
    delete eventHandlersRef[id];
  }
};

/**
 * 更新 Hex 網格
 */
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
  weatherLayer: L.LayerGroup, // Pass weatherLayer as a parameter
  updateStyles: (ids: string[], isDark: boolean) => void // Pass updateStyles callback
): Promise<void> => {
  try {
    if (!weatherLayer) {
      console.error("weatherLayer is not defined");
      return;
    }

    // 不清除 Hex Polygons，只清除其他類型的圖層
    weatherLayer.eachLayer((layer) => {
      if (!(layer instanceof L.Polygon)) {
        weatherLayer.removeLayer(layer);
      }
    });

    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/weather`, {
      params: { lat: 24.9914, lng: 121.5667, radius: 99999 },
    });

    const rainGrid = response.data.data.rainGrid;
    if (!rainGrid || !rainGrid.hexGrid) {
      throw new Error("Invalid response structure: rainGrid or hexGrid is undefined");
    }

    const { cellSide, bbox, options } = rainGrid.hexGrid;
    const polyginIdToPreperties = rainGrid.polyginIdToPreperties;

    // 更新 propertiesMapRef
    const newPropertiesMap: Record<string, { avgRainDegree: number }> = Object.entries(polyginIdToPreperties).reduce(
      (acc, [id, data]) => {
        acc[id] = data as { avgRainDegree: number };
        return acc;
      },
      {} as Record<string, { avgRainDegree: number }>
    );

    // 使用一維陣列來對應 Hex Grid 的索引
    const oneDimensionalArray = polyginIdToPreperties.reduce((acc: any[], obj: Record<string, { avgRainDegree: number }>) => {
      Object.entries(obj).forEach(([id, data]) => {
        acc.push({ id, ...data });
      });
      return acc;
    }, []);

    const hexGrid = turf.hexGrid(bbox, cellSide, options);

    // 更新 propertiesMapRef
    for (const [id, data] of Object.entries(newPropertiesMap)) {
      propertiesMapRef[id] = data;
    }

    let currentSelectedIds = [...selectedPolygonIds];

    hexGrid.features.forEach((feature, index) => {
      const id = `${index + 1}`;
      feature.properties = { id };

      const coords: L.LatLngTuple[] = (feature.geometry.coordinates[0] as [number, number][]).map(
        ([lng, lat]) => [lat, lng]
      );

      const hexValue = oneDimensionalArray[index]?.avgRainDegree || 0;

      const existingHex = hexesById[id];
      const existingValue = propertiesMapRef[id]?.avgRainDegree;

      if (existingHex) {
        // 如果 hex 已存在，檢查值是否變動
        if (existingValue !== hexValue) {
          // 更新屬性
          propertiesMapRef[id].avgRainDegree = hexValue;

          // 更新樣式
          existingHex.setStyle({
            color: getColor(hexValue, isDark),
            fillColor: currentSelectedIds.includes(id)
              ? id === currentSelectedIds[0]
                ? "#ff6666" // 主選中顏色
                : "#ff6666" // 鄰居選中顏色
              : getColor(hexValue, isDark),
            fillOpacity: currentSelectedIds.includes(id) ? 0.8 : 0.5,
          });

          // 更新 Popup
          existingHex.getPopup()?.setContent(`Hex ID: ${id}<br>Avg Rain Degree: ${hexValue}`);
        }

        // 更新 hoverEnabled 和 depth 狀態
        if (hoverEnabled) {
          // 解除 Popup，綁定事件
          existingHex.unbindPopup();
          // 重新綁定事件（即使已經綁定，也會用最新的 depth）
          bindHoverEvents(existingHex, id, depth, hexesPerRow, radius, isDark, currentSelectedIds, setSelectedPolygonIds, setLocation, updateStyles);
        } else {
          // 解除事件，重新綁定 Popup
          unbindHoverEvents(existingHex, id);
          existingHex.bindPopup(`Hex ID: ${id}<br>Avg Rain Degree: ${hexValue}`);
        }

      } else {
        // 如果 hex 不存在，創建並添加
        const polygon = L.polygon(coords, {
          color: getColor(hexValue, isDark),
          weight: 1,
          fillOpacity: 0.5,
        });

        // 保存 polygon 的中心點
        polygonIdToLatLng.set(Number(id), {
          lat: coords[0][0],
          lng: coords[0][1],
        });

        polygon.bindPopup(`Hex ID: ${id}<br>Avg Rain Degree: ${hexValue}`);

        hexesById[id] = polygon;
        propertiesMapRef[id] = { avgRainDegree: hexValue };
        weatherLayer.addLayer(polygon);

        if (hoverEnabled) {
          bindHoverEvents(polygon, id, depth, hexesPerRow, radius, isDark, currentSelectedIds, setSelectedPolygonIds, setLocation, updateStyles);
        }
      }
    });

    // 處理刪除不再存在的 Hex
    const newHexIds = new Set(hexGrid.features.map((feature, index) => `${index + 1}`));
    Object.keys(hexesById).forEach((existingId) => {
      if (!newHexIds.has(existingId)) {
        weatherLayer.removeLayer(hexesById[existingId]);
        delete hexesById[existingId];
        delete propertiesMapRef[existingId];
        delete eventHandlersRef[existingId];
      }
    });

    // 更新選中樣式
    updateStyles(currentSelectedIds, isDark);

    // 確保 weatherLayer 被添加到地圖上
    if (!map.hasLayer(weatherLayer)) {
      weatherLayer.addTo(map);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
};