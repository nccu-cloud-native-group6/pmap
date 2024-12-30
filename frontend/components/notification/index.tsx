"use client";

import { useState, useEffect } from "react";
import {
  Badge,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
} from "@nextui-org/react";
import { useSocket } from "../../app/socketProvider";
import { NotificationIcon } from "./notificationIcon";
import { polygonIdToLatLng } from "../map/addHexGrid";

import { toast, ToastOptions } from "react-toastify";

import { useTheme } from "../../contexts/ThemeContext";
import { rainDescriptions } from "../header/RainDegreeDisplay";

interface NotificationProps {
  mapRef: React.MutableRefObject<L.Map | null>;
}

interface NotificationHistory {
  id: number;
  title: string;
  message: string;
  time: string;
}

export default function Notification({ mapRef }: NotificationProps) {
  const socket = useSocket();
  const { isDark }= useTheme();

  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);

  const FLY_TO_ZOOM = 14;

  const DEFAULT_TOAST_OPTIONS: ToastOptions = {
    position: "top-right",
    autoClose: false,
    closeOnClick: true,
    pauseOnHover: true,
    theme: (isDark)? "dark" : "light",
  };

  const handleNotification = (data: any) => {
    const notification = parseNotificationData(data);
    let message = "Expired notficiation";

    switch (notification.type) {
      case NotificationType.WEATHER_SUMMARY:
        message = handleWeatherSummaryNotification(
          notification as FixedTimeSummaryNotification
        );
        break;
      case NotificationType.NEW_REPORT:
        message = handleReportNotification(
          notification as NewReportNotification
        );
        break;
      default:
        console.log("Unknown notification type");
        return;
    }

    const newNotification = {
      id: notifications.length + 1,
      title: notification.type!.toString(),
      message: message,
      time: new Date().toLocaleTimeString(),
    };

    setNotifications([...notifications, newNotification]);
  };


  const showSummaryNotification = (
    data: FixedTimeSummaryNotification,
    onClick?: () => void
  ): string => {
    console.log("Showing summary notification");
    const message = formatSummaryMessage(data);
    toast(message, { ...DEFAULT_TOAST_OPTIONS, onClick, icon: <span>📣</span>});
    return message;
  }

  const showReportNotification = (
    data: NewReportNotification,
    onClick?: () => void
  ) : string =>  {
    const message = formatNewReportMessage(data);
    toast(message, { ...DEFAULT_TOAST_OPTIONS, onClick, icon: <span>📣</span>});
    return message;
  }


  const handleWeatherSummaryNotification = (
    notification: FixedTimeSummaryNotification
  ): string => {
    const polygonId = notification.rainDegree[0].id;

    const message = showSummaryNotification(notification, () => {
      
      // Trigger when user click on the notification
      const latLng = polygonIdToLatLng.get(polygonId);
      if (!latLng) return;

      mapRef.current?.flyTo(latLng, FLY_TO_ZOOM);
    });
    return message;
  };

  const handleReportNotification = (
    notification: NewReportNotification
  ): string => {
    const polygonId = notification.polygonId;

    const message = showReportNotification(notification, () => {

      // Trigger when user click on the notification
      // Maybe go to the report
      const latLng = polygonIdToLatLng.get(Number(polygonId));
      if (!latLng) return;

      mapRef.current?.flyTo(latLng, FLY_TO_ZOOM);
    });
    return message;
  };

  useEffect(() => {
    if (socket?.connected) {
      console.log("[Notification] Socket connected");
      function handleMessage(data: string) {
        console.log("[Notification] Socket.io receiving:", data);
        handleNotification(data);
      }
      
      socket.on("message", handleMessage);

      // 清理事件
      return () => {
        console.log("[Notification] off message");
        socket.off("message", handleMessage);
      };
    } else {
      console.log("[Notification] Socket not connected");
      socket?.connect()
    }
  }, [socket?.connected]);

  const clearNotifications = () => setNotifications([]);

  return (
    <Popover>
      <PopoverTrigger>
        
        <Button isIconOnly aria-label="notifications" variant="light">
          <Badge content={notifications.length} shape="circle" color="danger">
            <NotificationIcon size={24} />

          </Badge>
        </Button>
      </PopoverTrigger>

      <PopoverContent>
        <div style={{ padding: "1rem", width: "300px" }}>
          <h4 style={{ marginBottom: "1rem" }}>Notifications</h4>
          <Divider />
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              marginTop: "1rem",
              marginBottom: "1rem",
            }}
          >
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  style={{
                    marginBottom: "0.5rem",
                    marginLeft: "0.5rem",
                    marginRight: "0.5rem",
                    padding: "1rem",
                  }}
                >
                  <CardHeader>
                    <h5>{notification.title}</h5>
                  </CardHeader>
                  <CardBody>
                    <p>{notification.message}</p>
                  </CardBody>
                  <CardFooter>
                    <small style={{ color: "gray" }}>{notification.time}</small>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p style={{ color: "gray", textAlign: "center" }}>
                No new notifications
              </p>
            )}
          </div>
          <Divider />
          <Button
            size="sm"
            color="danger"
            radius="full"
            onClick={clearNotifications}
            disabled={notifications.length === 0}
            style={{ marginTop: "1rem", width: "100%" }}
          >
            Clear All
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Define type for Fixed Time Summary notification
interface FixedTimeSummaryNotification {
  userId: string;
  email: string;
  subId: string;
  nickname: string;
  rainDegree: { id: number; avgRainDegree: number }[];
  type?: NotificationType;
}

// Define type for New Report notification
interface NewReportNotification {
  userId: string;
  email: string;
  subId: string;
  nickname: string;
  reportId: string;
  polygonId: number;
  rainDegree: number;
  type?: NotificationType;
}

export const enum NotificationType {
  WEATHER_SUMMARY = "WEATHER_SUMMARY",
  NEW_REPORT = "NEW_REPORT",
}

const formatSummaryMessage = (
  data: FixedTimeSummaryNotification
): string => {
  const rainDegrees = data.rainDegree.map((degree) => degree.avgRainDegree);
  const avgRainDegree =
    rainDegrees.reduce((acc, degree) => acc + degree, 0) / rainDegrees.length;
  return `${data.nickname} 目前是 ${rainDescriptions[Number(avgRainDegree)]} (${avgRainDegree})`;
};

const formatNewReportMessage = (data: NewReportNotification): string => {
  return `${data.nickname} 出現了新的回報：${rainDescriptions[data.rainDegree]}(${data.rainDegree})`;
};

/**
 * Parse and attach type to notification data
 */
function parseNotificationData(
  data: string
): FixedTimeSummaryNotification | NewReportNotification {
  const parsedData = JSON.parse(data);
  
  if (parsedData.hasOwnProperty("polygonId")) {
    parsedData.type = NotificationType.NEW_REPORT;
    return parsedData as NewReportNotification;
  }
  
  parsedData.type = NotificationType.WEATHER_SUMMARY;
  return parsedData as FixedTimeSummaryNotification;
}
