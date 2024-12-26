"use client";

import React, { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/react";
import { ModalProvider } from "../contexts/ModalContext"; // Modal 狀態管理
import { MapProvider } from "../contexts/MapContext"; // 地圖狀態管理
import { UserProvider } from "../contexts/UserContext"; // 使用者狀態管理
import { ThemeProvider } from "../contexts/ThemeContext"; // 主題狀態管理

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider basePath='/auth'>
      <UserProvider>
        <NextUIProvider>
          <ModalProvider>
          <ThemeProvider>
            <MapProvider>{children}</MapProvider>
            </ThemeProvider>
          </ModalProvider>
        </NextUIProvider>
      </UserProvider>
    </SessionProvider>
  );
}
