import { useRef, useEffect } from "react";
import { useModal } from "../contexts/ModalContext";
import { useMap } from "../contexts/MapContext";
import { Report } from "../types/report";

export const usePageController = () => {
  const mapRef = useRef<any>(null); // 地圖參考
  const { state: modalState, dispatch: modalDispatch } = useModal();
  const { dispatch: mapDispatch } = useMap();

  const handleSubmitData = (report: Report) => {
    if (
      typeof window !== "undefined" &&
      report.location.lat &&
      report.location.lng &&
      mapRef.current
    ) {
      // 更新地圖視野
      mapRef.current.flyTo([report.location.lat, report.location.lng], 17);
      import("leaflet").then((L) => {
        L.marker([report.location.lat, report.location.lng]).addTo(mapRef.current);
      });

      // 更新地圖狀態
      mapDispatch({ type: "SET_LOCATION", payload: report.location });
      mapDispatch({ type: "ADD_MARKER", payload: report.location });
    }

    console.log("Report Submitted:", report);
    modalDispatch({ type: "CLOSE_MODAL" });
  };

  const handleCloseModal = () => {
    modalDispatch({ type: "CLOSE_MODAL" });
  };

  useEffect(() => {
    if (mapRef.current) {
      console.log("Map reference initialized:", mapRef.current);
    }
  }, [mapRef.current]);

  return {
    mapRef,
    modalState,
    handleSubmitData,
    handleCloseModal,
  };
};
