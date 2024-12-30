'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "../contexts/UserContext";

declare module "next-auth" {
  interface Session {
    access_token?: string;
    provider?: string;
  }
}

const SocketContext = createContext<Socket | null>(null);

const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {

  const { user } = useUser();

  const [socket, setSocket] = useState<Socket | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    if(!user || !user?.access_token) {
      console.log("[Socket] No access token");
      return;
    }
    
    if (newSocket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(newSocket.io.engine.transport.name);

      newSocket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
      
      console.log("Socket.IO connected id:", newSocket.id);
      
      setSocket(newSocket);
      console.log("SocketProvider set socket:", newSocket);
      
      console.log("Sending user id to server:", user!.id);
      newSocket.emit('message', JSON.stringify({ userId: user!.id }));
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
      console.log("Socket.IO disconnected");
    }

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);

    return () => {
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
    };
  }, [user?.access_token]);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
