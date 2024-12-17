// hooks/usePageController.tsx
import { useRef } from "react";
import { useModal } from "../contexts/ModalContext";
import { useMap } from "../contexts/MapContext";
import L from "leaflet";

export const usePageController = () => {
  const mapRef = useRef<any>(null); // 地圖實例參考
  const { state: modalState, dispatch: modalDispatch } = useModal();
  const { dispatch: mapDispatch } = useMap();

  // 處理 Modal 資料提交邏輯
  const handleSubmitData = (data: { name: string; rainRating: number; location: { lat: number; lng: number } }) => {
    if (data.location.lat && data.location.lng && mapRef.current) {
      mapRef.current.setView([data.location.lat, data.location.lng], 17);
      L.marker([data.location.lat, data.location.lng]).addTo(mapRef.current);

      // 更新地圖狀態
      mapDispatch({ type: "SET_LOCATION", payload: data.location });
      mapDispatch({ type: "ADD_MARKER", payload: data.location });
    }
    modalDispatch({ type: "CLOSE_MODAL" }); // 關閉 Modal
  };

  const handleCloseModal = () => {
    modalDispatch({ type: "CLOSE_MODAL" });
  };

  return {
    mapRef,
    modalState,
    handleSubmitData,
    handleCloseModal,
  };
};
