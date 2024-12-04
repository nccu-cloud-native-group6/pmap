// components/indess.tsx
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// 使用 next/dynamic 來動態加載地圖元件，禁用 SSR
const Map = dynamic(() => import('./map'), {
    loading: () => <p>A map is loading</p>, // TODO: Use nextui loading component
    ssr: false, // 禁用伺服器端渲染
});

const MapWrapper: React.FC = () => {
    return <Map />;
};

export default MapWrapper;
