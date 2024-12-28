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
        const popupContainer = document.createElement("div");
        popupContainer.style.width = "250px"; // Set fixed width to match ReportPopup
        popupContainer.style.overflow = "hidden"; // Prevent overflow
        popupContainer.style.borderRadius = "8px"; // Add rounded corners
        popupContainer.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)"; // Add shadow effect

        const marker = L.marker([lat, lng]);

        // Fetch and render detailed report information
        getReportDetail(report.id, token).then((detailData) => {
          if (detailData) {
            const { reporterName, comment, photoUrl, reporterAvatar } = detailData.data.reportDetail;

            // Render React popup
            const root = createRoot(popupContainer);
            root.render(
              React.createElement(ReportPopup, {
                userName: reporterName,
                rainDegree: report.rainDgreee,
                comment: comment,
                photoUrl: photoUrl,
              })
            );

            // Create a custom avatar icon
            const avatarIcon = L.divIcon({
              className: "custom-user-icon",
              html: `<img src="${reporterAvatar}" alt="Avatar" style="border-radius:50%; width:50px; height:50px;" />`,
              iconSize: [50, 50],
              iconAnchor: [25, 50],
            });

            marker.setIcon(avatarIcon);
          }
        });

        marker.bindPopup(popupContainer); // Bind the React-rendered popup to the marker

        // Add marker to the reportLayer
        marker.addTo(reportLayer);
      }
    );
  } catch (error) {
    console.error("Error adding report markers:", error);
  }
};

/**
 * Fetch report detail by ID and log the result.
 * @param id - The report ID.
 * @param token - A unique identifier or token for authentication.
 */
export const getReportDetail = async (id: number, token: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/reports/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch report detail: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching report detail:", error);
  }
};
