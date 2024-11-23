import React from 'react';
import Map from './map'; // Adjust the import path as necessary

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="en">
        <body>{children}
          <Map />
        </body>
      </html>
    )
  }