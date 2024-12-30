"use client";

import React, { ReactNode } from "react";
import ToastProvider from "./ToastProvider"; // 引入剛才建立的 Providers
import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/react";
import { ModalProvider } from "../contexts/ModalContext"; // Modal 狀態管理
import { MapProvider } from "../contexts/MapContext"; // 地圖狀態管理
import { UserProvider } from "../contexts/UserContext"; // 使用者狀態管理
import { ThemeProvider } from "../contexts/ThemeContext"; // 主題狀態管理
import { MapLayerProvider } from "../contexts/MapLayerContext"; // 地圖圖層狀態管理
import { SocketProvider } from "./socketProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider basePath='/auth'>
          <MapLayerProvider>
      <UserProvider>
        <NextUIProvider>
          <ModalProvider>
            <ThemeProvider>
                <SocketProvider>
                  <MapProvider>
                    <ToastProvider>{children}</ToastProvider>
                  </MapProvider>
                </SocketProvider>
            </ThemeProvider>
          </ModalProvider>
        </NextUIProvider>
      </UserProvider>
      </MapLayerProvider>
    </SessionProvider>
  );
}
