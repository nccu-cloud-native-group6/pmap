import React, { createContext, useContext, useReducer, ReactNode } from "react";

interface ModalState {
  isOpen: boolean;
}

type ModalAction = { type: "OPEN_MODAL" } | { type: "CLOSE_MODAL" };

const initialState: ModalState = { isOpen: true };

const ModalContext = createContext<{ state: ModalState; dispatch: React.Dispatch<ModalAction> } | undefined>(undefined);

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "OPEN_MODAL":
      return { isOpen: true };
    case "CLOSE_MODAL":
      return { isOpen: false };
    default:
      return state;
  }
}

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(modalReducer, initialState);
  return <ModalContext.Provider value={{ state, dispatch }}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within a ModalProvider");
  return context;
};
