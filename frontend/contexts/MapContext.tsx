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
  selectedLocation: Location;
  selectedIds: string[]; // 選中的多邊形及其鄰居的 ID 列表
  selectedAdress: string; // 選中的多邊形的地址
}

type MapAction =
  | { type: "SET_LOCATION"; payload: Location }
  | { type: "ADD_MARKER"; payload: Location }
  | { type: "SET_HOVER_ENABLED"; payload: boolean }
  | { type: "SET_DEPTH"; payload: number }
  | { type: "SET_SELECTED_IDS"; payload: string[] } // 新增設定選中 ID 列表的 Action
  | { type: "SET_SELECTED_LOCATION"; payload: Location }; // 新增設定選中多邊形 ID 的 Action

const initialState: MapState = {
  location: {},
  markers: [],
  hoverEnabled: false,
  depth: 1,
  selectedLocation: {}, // 初始為空
  selectedIds: [], // 初始為空
  selectedAdress: "", // 初始為空
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
    case "SET_SELECTED_IDS":
      return { ...state, selectedIds: action.payload }; // 更新選中的 ID 列表
    case "SET_SELECTED_LOCATION":
      return { ...state, selectedLocation: action.payload };
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
