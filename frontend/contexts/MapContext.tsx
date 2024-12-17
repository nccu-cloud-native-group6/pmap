import React, { createContext, useContext, useReducer, ReactNode } from "react";

interface Location {
  lat?: number;
  lng?: number;
}

interface MapState {
  location: Location;
  markers: Location[];
}

type MapAction =
  | { type: "SET_LOCATION"; payload: Location }
  | { type: "ADD_MARKER"; payload: Location };

const initialState: MapState = { location: {}, markers: [] };

const MapContext = createContext<{ state: MapState; dispatch: React.Dispatch<MapAction> } | undefined>(undefined);

function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case "SET_LOCATION":
      return { ...state, location: action.payload };
    case "ADD_MARKER":
      return { ...state, markers: [...state.markers, action.payload] };
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
