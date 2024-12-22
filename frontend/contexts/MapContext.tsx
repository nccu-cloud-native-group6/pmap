import React, { createContext, useContext, useReducer, ReactNode } from "react";

interface Location {
  lat?: number;
  lng?: number;
}

interface MapState {
  location: Location;
  markers: Location[];
  hoverEnabled: boolean;
  depth: number;
  selectedPolygonId: string | null; // 當前選中的多邊形 ID
  selectedIds: string[]; // 選中的多邊形及其鄰居的 ID 列表
}

type MapAction =
  | { type: "SET_LOCATION"; payload: Location }
  | { type: "ADD_MARKER"; payload: Location }
  | { type: "SET_HOVER_ENABLED"; payload: boolean }
  | { type: "SET_DEPTH"; payload: number }
  | { type: "SET_SELECTED_POLYGON"; payload: string | null }
  | { type: "SET_SELECTED_IDS"; payload: string[] }; // 新增設定選中 ID 列表的 Action

const initialState: MapState = {
  location: {},
  markers: [],
  hoverEnabled: false,
  depth: 1,
  selectedPolygonId: null,
  selectedIds: [], // 初始為空
};

const MapContext = createContext<{ state: MapState; dispatch: React.Dispatch<MapAction> } | undefined>(undefined);

function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case "SET_DEPTH":
      return { ...state, depth: action.payload };
    case "SET_LOCATION":
      return { ...state, location: action.payload };
    case "ADD_MARKER":
      return { ...state, markers: [...state.markers, action.payload] };
    case "SET_HOVER_ENABLED":
      return { ...state, hoverEnabled: action.payload };
    case "SET_SELECTED_POLYGON":
      return { ...state, selectedPolygonId: action.payload }; // 更新當前選中的多邊形 ID
    case "SET_SELECTED_IDS":
      console.log("Selected IDs:", action.payload);
      return { ...state, selectedIds: action.payload }; // 更新選中的 ID 列表
    default:
      return state;
  }
}

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(mapReducer, initialState);
  return <MapContext.Provider value={{ state, dispatch }}>{children}</MapContext.Provider>;
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap must be used within a MapProvider");
  return context;
};
