import L from "leaflet";
import { createRoot } from "react-dom/client";
import React from "react";
import ReportPopup from "../../components/popup/ReportPopup";

const existingMarkers = new Map(); // Track existing markers by report ID

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

    // Function to map rainDegree to a color
    const getColorFromRainDegree = (rainDegree: number) => {
      const colors = ["#FFFF00","#CCE5FF", "#99CCFF", "#3399FF", "#0066CC", "#003399"];
      return colors[rainDegree];
    };

    // Iterate over the reports and add markers
    data.data.reports.forEach(
      async (report: {
        id: number;
        rainDgreee: number;
        latlng: { lat: number; lng: number };
      }) => {
        if (!existingMarkers.has(report.id)) {
          const { lat, lng } = report.latlng;
          const popupContainer = document.createElement("div");
          popupContainer.style.width = "250px"; // Set fixed width to match ReportPopup
          popupContainer.style.overflow = "hidden"; // Prevent overflow
          popupContainer.style.borderRadius = "8px"; // Add rounded corners
          popupContainer.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)"; // Add shadow effect
          const marker = L.marker([lat, lng]);

          // Fetch and render detailed report information
          const detailData = await getReportDetail(report.id, token);
          if (detailData) {
            const { reporterName, comment, photoUrl, reporterAvatar } = detailData.data.reportDetail;
            if (photoUrl) {
              console.log(photoUrl);
            }

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

            // Get border color based on rainDegree
            const borderColor = getColorFromRainDegree(report.rainDgreee);

            // Create a custom avatar icon with border color
            const avatarIcon = L.divIcon({
              className: "custom-user-icon",
              html: `<div style="border: 3px solid ${borderColor}; border-radius: 50%; width: 40px; height: 40px; overflow: hidden;">
                  <img src="${reporterAvatar}" alt="Avatar" style="width: 100%; height: 100%; bg-color: #7a20a2;">
                </div>`,
              iconSize: [50, 50],
              iconAnchor: [25, 50],
            });

            marker.setIcon(avatarIcon);
          }

          marker.bindPopup(popupContainer, { offset: [0, -40] }); // Bind the React-rendered popup to the marker

          // Add marker to the reportLayer and track it
          marker.addTo(reportLayer);
          existingMarkers.set(report.id, marker);
        }
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
