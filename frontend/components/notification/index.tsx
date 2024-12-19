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
import { useSession } from "next-auth/react";

export default function Notification() {
  const socket = useSocket();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Comment",
      message: "You have a new comment on your post.",
      time: "2 mins ago",
    },
  ]);
  const { data: session } = useSession();

  useEffect(() => {
    if (socket && session?.user){
      console.log("Socket.IO connected for notifications");

      // 接收伺服器推送的通知
      socket.auth = { token: session.access_token , userId: session.user.email, provider: session.user.provider};
      socket.connect();
      console.log(`Socket.IO connected as: ${session.user.email}`);
      socket.on("new-notification", (notification) => {
        console.log("Received new notification:", notification);
        setNotifications((prev) => [...prev, notification]);
      });

      // 清理事件
      return () => {
        socket.off("new-notification");
        socket.disconnect();
      };
    }
  }, [socket]);

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