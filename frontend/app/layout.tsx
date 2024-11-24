'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

export default function RootLayout({
    children,
    session,
}: {
    children: React.ReactNode;
    session?: Session; // 可選屬性，用於提供初始化的會話
}) {
    return (
        <html lang="en">
            <body>
                {/* 包裹 SessionProvider 確保子組件可以訪問身份驗證上下文 */}
                <SessionProvider session={session}>
                    {children}
                </SessionProvider>
            </body>
        </html>
    );
}
