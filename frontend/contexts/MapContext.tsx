import React, { createContext, useContext, useReducer, ReactNode } from "react";

interface Location {
  lat?: number;
  lng?: number;
}

interface MapState {
  location: Location;
  markers: Location[];
  hoverEnabled: boolean; // 新增 hoverEnabled 屬性
}

type MapAction =
  | { type: "SET_LOCATION"; payload: Location }
  | { type: "ADD_MARKER"; payload: Location }
  | { type: "SET_HOVER_ENABLED"; payload: boolean }; // 新增控制 hover 的 action

const initialState: MapState = { location: {}, markers: [], hoverEnabled: false };

const MapContext = createContext<{ state: MapState; dispatch: React.Dispatch<MapAction> } | undefined>(undefined);

function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case "SET_LOCATION":
      return { ...state, location: action.payload };
    case "ADD_MARKER":
      return { ...state, markers: [...state.markers, action.payload] };
    case "SET_HOVER_ENABLED":
      return { ...state, hoverEnabled: action.payload }; // 更新 hoverEnabled 狀態
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
