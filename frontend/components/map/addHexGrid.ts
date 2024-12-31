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

// 保存 Hex ID 到其中心位置的映射
export const polygonIdToLatLng: Map<number, Location> = new Map();

// 持久化 hexesById / propertiesMapRef / eventHandlersRef
const hexesById: Record<string, L.Polygon> = {};
const propertiesMapRef: Record<string, { avgRainDegree: number }> = {};
const eventHandlersRef: Record<
  string,
  {
    mouseover: (e: L.LeafletMouseEvent) => void;
    mouseout: (e: L.LeafletMouseEvent) => void;
    click: (e: L.LeafletMouseEvent) => void;
  }
> = {};

/**
 * 綁定事件：hover + click
 */
function bindHoverEvents(
  polygon: L.Polygon,
  id: string,
  depth: number,
  hexesPerRow: number,
  radius: number,
  isDark: boolean,
  currentSelectedIds: string[],
  setSelectedPolygonIds: (ids: string[]) => void,
  setLocation: (location: Location) => void,
  updateStyles: (ids: string[], isDarkTheme: boolean) => void
) {
  // 先確保舊的事件都解除
  unbindHoverEvents(polygon, id);

  // ===== MOUSEOVER =====
  const mouseoverHandler = (e: L.LeafletMouseEvent) => {
    const currentId = parseInt(id, 10);
    const neighborIds = getNeighborIds(currentId, depth, hexesPerRow);

    const center = polygon.getBounds().getCenter();
    const centerCoords: [number, number] = [center.lng, center.lat];

    const circle = turf.circle(centerCoords, radius / 1000, {
      units: "kilometers",
    });

    neighborIds.forEach((neighborId) => {
      const neighborPolygon = hexesById[neighborId.toString()];
      if (!neighborPolygon) return;

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
    });

  };

  // ===== MOUSEOUT =====
  const mouseoutHandler = (e: L.LeafletMouseEvent) => {
    // mouseout 要回復所有 polygon 的原本樣式
    updateStyles(currentSelectedIds, isDark);
    // recover the original style of the polygon
    const currentId = parseInt(id, 10);
    const neighborIds = getNeighborIds(currentId, depth, hexesPerRow);

    neighborIds.forEach((neighborId) => {
      const neighborPolygon = hexesById[neighborId.toString()];
      if (!neighborPolygon) return;

      const hexValue = propertiesMapRef[neighborId.toString()]?.avgRainDegree || 0;

      neighborPolygon.setStyle({
        fillColor: currentSelectedIds.includes(neighborId.toString())
          ? "#ff6666"
          : getColor(hexValue, isDark),
        fillOpacity: currentSelectedIds.includes(neighborId.toString()) ? 0.8 : 0.5,
      });
    });
    
  };

  // ===== CLICK =====
  const clickHandler = (e: L.LeafletMouseEvent) => {
    // 更新位置
    setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });

    const currentId = parseInt(id, 10);
    const neighborIds = getNeighborIds(currentId, depth, hexesPerRow);

    // 用一個新的陣列來累積更新後的 selectedIDs
    const updatedSelectedIds: string[] = [];

    // 自己先加
    updatedSelectedIds.push(id);

    // 算出鄰居，再判斷 circle
    const center = polygon.getBounds().getCenter();
    const centerCoords: [number, number] = [center.lng, center.lat];
    const circle = turf.circle(centerCoords, radius / 1000, { units: "kilometers" });

    neighborIds.forEach((neighborId) => {
      const neighborPolygon = hexesById[neighborId.toString()];
      if (!neighborPolygon) return;

      const neighborCenter = neighborPolygon.getBounds().getCenter();
      const neighborPoint = turf.point([neighborCenter.lng, neighborCenter.lat]);

      if (turf.booleanIntersects(neighborPoint, circle)) {
        updatedSelectedIds.push(neighborId.toString());
      }
    });

    setSelectedPolygonIds(updatedSelectedIds);
    updateStyles(updatedSelectedIds, isDark);
  };

  polygon.on("mouseover", mouseoverHandler);
  polygon.on("mouseout", mouseoutHandler);
  polygon.on("click", clickHandler);

  // 存到 eventHandlersRef
  eventHandlersRef[id] = { mouseover: mouseoverHandler, mouseout: mouseoutHandler, click: clickHandler };
}

/**
 * 解除綁定事件
 */
function unbindHoverEvents(polygon: L.Polygon, id: string) {
  const handlers = eventHandlersRef[id];
  if (!handlers) return;

  polygon.off("mouseover", handlers.mouseover);
  polygon.off("mouseout", handlers.mouseout);
  polygon.off("click", handlers.click);

  // 徹底清除
  delete eventHandlersRef[id];
}

/**
 * 主要函式：更新 Hex Grid
 */
export async function addHexGrid(
  map: L.Map,
  isDark: boolean,
  layerGroup: L.LayerGroup,
  hoverEnabled: boolean,
  depth: number,
  radius: number,
  hexesPerRow: number,
  selectedPolygonIds: string[],
  setSelectedPolygonIds: (ids: string[]) => void,
  setLocation: (location: Location) => void,
  weatherLayer: L.LayerGroup,
  updateStyles: (ids: string[], isDarkTheme: boolean) => void
) {
  try {
    if (!weatherLayer) {
      console.error("weatherLayer is not defined");
      return;
    }

    // 只清除非-polygon layer
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
      throw new Error("Invalid response: missing hexGrid");
    }

    const { cellSide, bbox, options } = rainGrid.hexGrid;
    const polyginIdToPreperties = rainGrid.polyginIdToPreperties;

    // 更新 propertiesMapRef
    const newPropertiesMap: Record<string, { avgRainDegree: number }> = Object.entries(polyginIdToPreperties).reduce(
      (acc: Record<string, { avgRainDegree: number }>, [id, data]) => {
        acc[id] = data as { avgRainDegree: number };
        return acc;
      },
      {} as Record<string, { avgRainDegree: number }>
    );

    // 一維陣列，用來對應 hexGrid.features 的順序
    const oneDimArray = polyginIdToPreperties.reduce((acc: any[], obj: Record<string, { avgRainDegree: number }>) => {
      Object.entries(obj).forEach(([pid, data]) => {
        acc.push({ id: pid, ...data });
      });
      return acc;
    }, []);

    const hexGrid = turf.hexGrid(bbox, cellSide, options);

    // 將新的屬性更新進 propertiesMapRef
    for (const [polyId, data] of Object.entries(newPropertiesMap)) {
      propertiesMapRef[polyId] = data;
    }

    let currentSelectedIds = [...selectedPolygonIds];

    hexGrid.features.forEach((feature, index) => {
      const id = `${index + 1}`;
      feature.properties = { id };

      const coords: L.LatLngTuple[] = (feature.geometry.coordinates[0] as [number, number][]).map(
        ([lng, lat]) => [lat, lng]
      );

      const hexValue = oneDimArray[index]?.avgRainDegree || 0;

      const existingHex = hexesById[id];
      const existingValue = propertiesMapRef[id]?.avgRainDegree;

      // 如果已存在
      if (existingHex) {
        // 若 avgRainDegree 有更新
        if (existingValue !== hexValue) {
          propertiesMapRef[id].avgRainDegree = hexValue;

          existingHex.setStyle({
            color: getColor(hexValue, isDark),
            fillColor: currentSelectedIds.includes(id)
              ? id === currentSelectedIds[0]
                ? "#ff6666"
                : "#ff6666"
              : getColor(hexValue, isDark),
            fillOpacity: currentSelectedIds.includes(id) ? 0.8 : 0.5,
          });

          existingHex.getPopup()?.setContent(`Hex ID: ${id}<br>Avg Rain Degree: ${hexValue}`);
        }

        // 關注 hoverEnabled & depth：
        if (hoverEnabled) {
          // 1) 解除 popup
          existingHex.unbindPopup();
          // 2) 無論之前有無綁定，都再綁一次，以確保 depth 更新
          bindHoverEvents(
            existingHex,
            id,
            depth,
            hexesPerRow,
            radius,
            isDark,
            currentSelectedIds,
            setSelectedPolygonIds,
            setLocation,
            updateStyles
          );
        } else {
          // 1) 解除 hoverEvents
          unbindHoverEvents(existingHex, id);
          // 2) 重新綁定 popup
          existingHex.bindPopup(`Hex ID: ${id}<br>Avg Rain Degree: ${hexValue}`);
        }
      } else {
        // 如果尚未建立
        const polygon = L.polygon(coords, {
          color: getColor(hexValue, isDark),
          weight: 1,
          fillOpacity: 0.5,
        });

        // 記錄中心點
        polygonIdToLatLng.set(Number(id), { lat: coords[0][0], lng: coords[0][1] });

        polygon.bindPopup(`Hex ID: ${id}<br>Avg Rain Degree: ${hexValue}`);

        hexesById[id] = polygon;
        propertiesMapRef[id] = { avgRainDegree: hexValue };
        weatherLayer.addLayer(polygon);

        if (hoverEnabled) {
          bindHoverEvents(
            polygon,
            id,
            depth,
            hexesPerRow,
            radius,
            isDark,
            currentSelectedIds,
            setSelectedPolygonIds,
            setLocation,
            updateStyles
          );
        }
      }
    });

    // 移除不存在的 Hex
    const newHexIds = new Set(hexGrid.features.map((_, i) => `${i + 1}`));
    Object.keys(hexesById).forEach((hexId) => {
      if (!newHexIds.has(hexId)) {
        weatherLayer.removeLayer(hexesById[hexId]);
        delete hexesById[hexId];
        delete propertiesMapRef[hexId];
        delete eventHandlersRef[hexId];
      }
    });

    // 呼叫一次 updateStyles，確保所有 Polygon 樣式一致
    updateStyles(currentSelectedIds, isDark);

    // 確保 weatherLayer 被加到地圖
    if (!map.hasLayer(weatherLayer)) {
      weatherLayer.addTo(map);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}