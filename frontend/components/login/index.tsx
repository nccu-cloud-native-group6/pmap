"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useSocket } from "../../app/socketProvider";
import {
  Button,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import "../../styles/globals.css";

export default function Login() {
  const { data: session } = useSession();
  const socket = useSocket();

  // 事件處理與伺服器交互
  useEffect(() => {
    if (socket && session?.user) {
      const userId = session.user.email; // 用戶唯一標識

      console.log("Socket.IO instance available for:", userId);

      // 發送測試事件
      socket.emit("test-event", { userId, message: "Hello, server!" });

      // 綁定回應事件
      const responseEvent = `test-response-${userId}`;
      socket.on(responseEvent, (data) => {
        console.log("Received response from server:", data);
      });

      socket.on("test-event", (data) => {
        console.log("Received test-event:", data);
        const responseEvent = `test-response-${data.userId}`;
        socket.emit(responseEvent, { message: "Hello, client!" });
      });

      const interval = setInterval(() => {
        socket.emit("heartbeat", { timestamp: Date.now() });
        console.log("Heartbeat sent");
      }, 1000); // 每秒發送心跳

      socket.on("heartbeat-response", (data) => {
        console.log("Received heartbeat response:", data);
      });
      

      // 處理用戶登錄事件
      socket.emit("user-login", { user: session.user });

      // 清理事件
      return () => {
        clearInterval(interval); // 清理定時器
        socket.off("heartbeat-response");
        console.log("Stopped heartbeat");
        console.log(`User logged out: ${session.user}`);
        socket.emit("user-logout", { user: session.user });
        socket.off(responseEvent);
      };
    } else {
      console.log("Socket.IO instance not available");
    }
  }, [socket, session]);

  return (
    <div className="flex items-center justify-end">
      {!session ? (
        <Dropdown>
          <DropdownTrigger>
            <Avatar size="sm" showFallback style={{ cursor: "pointer" }} alt="Login Avatar" />
          </DropdownTrigger>
          <DropdownMenu aria-label="Sign in options">
            <DropdownItem key="google" onClick={() => signIn("google")} startContent={<FaGoogle />}>
              Sign in with Google
            </DropdownItem>
            <DropdownItem key="github" onClick={() => signIn("github")} startContent={<FaGithub />}>
              Sign in with GitHub
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        <Popover>
          <PopoverTrigger>
            <Avatar
              src={session.user?.image || "/default-avatar.png"}
              alt="User Avatar"
              size="md"
              radius="full"
              color="primary"
            />
          </PopoverTrigger>
          <PopoverContent>
            <div
              style={{
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "0.5rem",
              }}
            >
              <Avatar
                src={session.user?.image || "/default-avatar.png"}
                alt="User Avatar"
                size="sm"
              />
              <p style={{ fontSize: "0.875rem", fontWeight: "bold" }}>{session.user?.name}</p>
              <p style={{ fontSize: "0.75rem", color: "#666" }}>{session.user?.email}</p>
              <Button color="danger" size="sm" onClick={() => signOut()}>
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
