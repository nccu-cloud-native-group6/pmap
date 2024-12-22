"use client";

import React, { useState } from "react";
import { Button, Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";
import CreateSubscription from "./CreateSubscrition" // 引入 CreateSubscription
import LoginPage from "./LoginPage";
import NoSubscriptionPage from "./NoSubscriptionPage";
import { useUser } from "../../contexts/UserContext";
import { Subscription } from "../../types/subscription"; // 引入 Subscription 型別

interface SlidingPanelProps {
  isOpen: boolean; // Panel 狀態
  onClose: () => void; // 關閉回調
}

const SlidingPanel: React.FC<SlidingPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useUser(); // 檢查用戶是否已登入
  const [isCreating, setIsCreating] = useState(false); // 是否進入創建訂閱模式
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]); // 訂閱列表
  const [editSubscription, setEditSubscription] = useState<Subscription | null>(null); // 當前編輯的訂閱

  const handleBack = () => {
    setIsCreating(false);
    setEditSubscription(null); // 清除編輯狀態
  };

  const handleCreateOrEditSubscription = (data: Subscription) => {
    if (editSubscription) {
      // 編輯模式
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === editSubscription.id ? { ...data, id: sub.id } : sub))
      );
      console.log("Subscription Updated:", data);
    } else {
      // 創建模式
      setSubscriptions((prev) => [...prev, { ...data, id: Date.now() }]); // 用時間戳模擬唯一 ID
      console.log("Subscription Created:", data);
    }
    setIsCreating(false);
    setEditSubscription(null); // 清除編輯狀態
  };

  const handleDelete = (id: number) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
    console.log("Subscription Deleted:", id);
  };

  const handleEdit = (subscription: Subscription) => {
    setEditSubscription(subscription);
    setIsCreating(true);
  };

  return (
    <div
      className={`h-full shadow-lg transition-transform ${
        isOpen ? "translate-x-0 w-1/3" : "translate-x-full w-0"
      }`}
    >
      {isOpen && (
        <div>
          {/* 如果未登入，顯示 LoginPage */}
          {!user ? (
            <LoginPage />
          ) : isCreating || editSubscription ? (
            <CreateSubscription
              onBack={handleBack}
              onSubmit={handleCreateOrEditSubscription}
              initialData={editSubscription ? (({ id, createdAt, updatedAt, ...rest }) => rest)(editSubscription) : undefined} // 傳遞初始資料（用於編輯）
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

              {/* 訂閱清單或提示頁 */}
              {subscriptions.length === 0 ? (
                <NoSubscriptionPage onCreate={() => setIsCreating(true)} />
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((sub) => (
                    <Card
                      key={sub.id}
                      isHoverable
                      isPressable={false}
                      className="rounded-lg shadow"
                    >
                      <CardHeader>
                        <h3 className="font-semibold">{sub.nickName}</h3>
                      </CardHeader>
                      <CardBody>
                        <p className="text-sm text-gray-600">
                          Alert Type: {sub.createdAt ? sub.createdAt.toLocaleString() : "N/A"}
                        </p>
                      </CardBody>
                      <CardFooter>
                        <Button
                          size="sm"
                          color="primary"
                          onPress={() => handleEdit(sub)}
                          className="mr-2"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          onPress={() => sub.id !== undefined && handleDelete(sub.id)}
                        >
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {/* 創建訂閱按鈕（僅當有訂閱時顯示） */}
              {subscriptions.length > 0 && (
                <div className="mt-6">
                  <Button color="primary" onPress={() => setIsCreating(true)}>
                    Create Subscription
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SlidingPanel;
