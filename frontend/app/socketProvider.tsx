'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

// TODO: this is jus tfor testing
import { toast } from 'react-toastify';
  
declare module "next-auth" {
  interface Session {
    access_token?: string;
    provider?: string;
  }
}

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession(); // 確保獲取 session
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    console.log("Socket provider initialized");
    console.log("Session status:", status);
    
    if (session?.access_token) {
      console.log("Initializing Socket.IO with url:", process.env.NEXT_PUBLIC_SOCKET_URL);
      
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

      newSocket.on("connect", () => {
        console.log("Socket.IO connected:", newSocket.id);
        const userId =  1; // TODO: Use real UserID
        // 發送訊息到伺服器
        newSocket.emit('message', JSON.stringify({ userId: userId }));
      });

          // 監聽來自伺服器的訊息
      newSocket.on('message', (data) => {
        console.log('Socket.io 來自伺服器的訊息:', data);
        // 收到訊息參考學長的格式
        toast(data);
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
