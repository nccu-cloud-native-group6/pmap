"use client";

import React, { useState } from "react";
import { Button } from "@nextui-org/react";
import CreateSubscription from "./CreateSubscription";
import LoginPage from "./LoginPage";
import { useUser } from "../../contexts/UserContext";

interface SlidingPanelProps {
  isOpen: boolean; // Panel 狀態
  onClose: () => void; // 關閉回調
}

const SlidingPanel: React.FC<SlidingPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useUser(); // 檢查用戶是否已登入
  const [isCreating, setIsCreating] = useState(false); // 是否進入創建訂閱模式

  const handleBack = () => setIsCreating(false); // 返回到訂閱列表
  const handleCreateSubscription = (data: any) => {
    console.log("Subscription Created:", data); // 處理提交的數據
    setIsCreating(false); // 提交後返回列表
  };

  return (
    <div
      className={`h-full shadow-lg transition-transform border-l ${
        isOpen ? "translate-x-0 w-1/3" : "translate-x-full w-0"
      }`}
    >
      {isOpen && (
        <div>
          {/* 如果未登入，顯示 LoginPage */}
          {!user ? (
            <LoginPage />
          ) : isCreating ? (
            // 如果在創建模式，顯示 CreateSubscription
            <CreateSubscription
              onBack={handleBack}
              onSubmit={handleCreateSubscription}
            />
          ) : (
            <div className="p-6">
              {/* Close 按鈕 */}
              <Button
                color="danger"
                className="absolute top-4 right-4"
                onPress={onClose}
              >
                Close
              </Button>

              {/* Panel 標題 */}
              <h2 className="text-xl font-bold mb-4">Your Subscriptions</h2>

              {/* 已訂閱清單 */}
              <ul className="space-y-4">
                <li className="p-4  rounded-lg shadow">
                  <h3 className="font-semibold">Region 1</h3>
                  <p className="text-sm text-gray-600">Rainfall Alerts Enabled</p>
                </li>
                <li className="p-4  rounded-lg shadow">
                  <h3 className="font-semibold">Region 2</h3>
                  <p className="text-sm text-gray-600">Rainfall Alerts Enabled</p>
                </li>
              </ul>

              {/* 創建訂閱按鈕 */}
              <div className="mt-6">
                <Button
                  color="primary"
                  onPress={() => setIsCreating(true)}
                >
                  Create Subscription
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SlidingPanel;
