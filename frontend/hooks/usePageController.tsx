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
      mapRef.current.setView([report.location.lat, report.location.lng], 17);
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
  const waitForMapInitialization = async () => {
    return new Promise<void>((resolve, reject) => {
      const interval = setInterval(() => {
        if (mapRef.current) {
          clearInterval(interval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        reject(new Error("Map initialization timeout"));
      }, 5000); // 最多等待 5 秒
    });
  };

  const handleZoomIn = (location: { lat: number; lng: number }) => {
    if (typeof window !== "undefined" && mapRef.current) {
      mapRef.current.setView([location.lat, location.lng], 17);
    } else {
      console.error("Map reference not found.");
    }
  }

  return {
    mapRef,
    modalState,
    handleSubmitData,
    handleCloseModal,
    handleZoomIn,
    waitForMapInitialization,
  };
};
