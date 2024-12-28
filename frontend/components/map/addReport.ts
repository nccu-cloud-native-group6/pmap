import L from "leaflet";
import { createRoot } from "react-dom/client";
import React from "react";
import ReportPopup from "../../components/popup/ReportPopup";

/**
 * Add report markers to the reportLayer.
 * @param reportLayer - The Leaflet LayerGroup for reports.
 * @param token - A unique identifier or token for authentication.
 */
export const addReport = async (
  reportLayer: L.LayerGroup,
  token: string
) => {
  try {
    // Fetch reports from API using the token
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/reports?lng=121.5667&lat=24.9914&radius=1000000000`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.statusText}`);
    }

    const data = await response.json();

    // Iterate over the reports and add markers
    data.data.reports.forEach(
      (report: {
        id: number;
        rainDgreee: number;
        latlng: { lat: number; lng: number };
      }) => {
        const { lat, lng } = report.latlng;
        const marker = L.marker([lat, lng]);

        const popupContainer = document.createElement("div");
        popupContainer.style.width = "250px"; // Set fixed width to match ReportPopup
        popupContainer.style.overflow = "hidden"; // Prevent overflow
        popupContainer.style.borderRadius = "8px"; // Add rounded corners
        popupContainer.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)"; // Add shadow effect

        // Use React to render the popup content
        const root = createRoot(popupContainer);
        root.render(React.createElement(ReportPopup, { rainDegree: report.rainDgreee }));

        marker.bindPopup(popupContainer); // Bind the React-rendered popup to the marker

        // Add marker to the reportLayer
        marker.addTo(reportLayer);
      }
    );
  } catch (error) {
    console.error("Error adding report markers:", error);
  }
};
