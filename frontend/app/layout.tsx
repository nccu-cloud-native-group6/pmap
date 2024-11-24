'use client';

import React, { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                <SessionProvider>
                    {children}
                </SessionProvider>
            </body>
        </html>
    );
}
