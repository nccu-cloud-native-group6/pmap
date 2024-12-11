'use client';

import React, { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import {NextUIProvider} from '@nextui-org/react'

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
                <SessionProvider>
                    <NextUIProvider>
                        {children}
                    </NextUIProvider>
                </SessionProvider>
    );
}
