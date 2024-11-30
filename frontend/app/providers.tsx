'use client';

import React, { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/react";
import { SocketProvider } from "./socketProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <body>
      <SessionProvider>
        <NextUIProvider>
          <SocketProvider>{children}</SocketProvider>
        </NextUIProvider>
      </SessionProvider>
    </body>
  );
}
