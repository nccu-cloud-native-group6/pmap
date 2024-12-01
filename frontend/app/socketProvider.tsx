'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

declare module "next-auth" {
  interface Session {
    access_token?: string;
  }
}

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession(); // 確保獲取 session
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.access_token) {
      console.log("Initializing Socket.IO with token:", session.access_token);

      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
        auth: { token: session.access_token },
        path: "/api/socket",
      });

      newSocket.on("connect", () => {
        console.log("Socket.IO connected:", newSocket.id);
      });

      setSocket(newSocket);

      return () => {
        console.log("Disconnecting Socket.IO");
        newSocket.disconnect();
      };
    } else {
      console.log("Waiting for authentication...");
    }
  }, [status, session?.access_token]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
