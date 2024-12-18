'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// 定義 MapWrapper 的 Props，包括 onMapLoad callback
interface MapWrapperProps {
  onMapLoad?: (mapInstance: any) => void;
}

// 使用 next/dynamic 來動態加載地圖元件，禁用 SSR
const Map = dynamic(() => import('./map'), {
  loading: () => <p>A map is loading</p>, 
  ssr: false, // 禁用伺服器端渲染
});

const MapWrapper: React.FC<MapWrapperProps> = ({ onMapLoad }) => {
  // 將 onMapLoad 傳入 Map 組件中
  return <Map onMapLoad={onMapLoad} />;
};

export default MapWrapper;
