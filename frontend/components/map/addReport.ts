import L from "leaflet";
import { createRoot } from "react-dom/client";
import React from "react";
import ReportPopup from "../../components/popup/ReportPopup";
import { useUserAvatar } from "../../composables/useUserAvatar";

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
    const { getUserAvatarHTML } = useUserAvatar();
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

    // Function to map rainDegree to a color (deprecated)
    const getColorFromRainDegree = (rainDegree: number) => {
      const colors = ["#FFFF00","#CCE5FF", "#99CCFF", "#3399FF", "#0066CC", "#003399"];
      return colors[rainDegree];
    };

    // Iterate over the reports and add markers
    data.data.reports.forEach((report: { id: number; latlng: { lat: number; lng: number }; rainDgreee: number; reporterAvatar: string }) => {
      if (!existingMarkers.has(report.id)) {
        const { lat, lng } = report.latlng;
        const popupContainer = document.createElement("div");
        popupContainer.style.width = "250px";
        popupContainer.style.overflow = "hidden";
        popupContainer.style.borderRadius = "8px";
        popupContainer.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    
        const marker = L.marker([lat, lng]);
        const root = createRoot(popupContainer);
    
        // 初始化彈窗內容為 "加載中..."
      root.render(
        React.createElement("div", {
          style: { display: "flex", justifyContent: "center", alignItems: "center", height: "100%" },
          children: React.createElement(require("@nextui-org/react").Spinner, {})
        })
      );
    
        marker.bindPopup(popupContainer, { offset: [0, -40] });
    
        // 點擊標記時加載詳細數據
        marker.on("click", async () => {
          try {
            const detailData = await getReportDetail(report.id, token);
            if (detailData) {
              const { reporterName, comment, photoUrl } = detailData.data.reportDetail;
    
              
              root.render(
                React.createElement(ReportPopup, {
                  userName: reporterName,
                  rainDegree: report.rainDgreee,
                  comment: comment,
                  photoUrl: photoUrl.replace("/undefined", ""),
                })
              );
            }
          } catch (error) {
            popupContainer.innerHTML = "<div style='color:red;'>Failed to load data.</div>";
            console.error(error);
          }
        });
    
        // 使用自訂的 Avatar 標記
        const avatarHTML = getUserAvatarHTML({ photoUrl: report.reporterAvatar || `/cwaicon.jpg`} );
        const avatarIcon = L.divIcon({
          className: "custom-user-icon",
          html: avatarHTML,
          iconSize: [50, 50],
          iconAnchor: [25, 50],
        });
    
        marker.setIcon(avatarIcon);
    
        // 添加標記到地圖和記錄
        marker.addTo(reportLayer);
        existingMarkers.set(report.id, marker);
      }
    });
    
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
    console.log("Report detail:", data);
    return data;
  } catch (error) {
    console.error("Error fetching report detail:", error);
  }
};
