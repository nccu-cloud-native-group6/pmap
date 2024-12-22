"use client";

import React, { useState, useEffect } from "react";
import { Input, Button, Spacer, Spinner, SelectItem, Select } from "@nextui-org/react";
import { useMap } from "../../contexts/MapContext";
import { Subscription } from "../../types/subscription";

interface CreateSubscriptionProps {
  onBack: () => void; // 回上一頁的回調
  onSubmit: (data: Omit<Subscription, "id" | "createdAt" | "updatedAt">) => void; // 表單提交的回調
  initialData?: Omit<Subscription, "id" | "createdAt" | "updatedAt">; // 初始資料（用於編輯模式）
}

const CreateSubscription: React.FC<CreateSubscriptionProps> = ({
  onBack,
  onSubmit,
  initialData,
}) => {
  const { dispatch } = useMap(); // 使用 MapContext 來控制 hover 和範圍

  // 初始化狀態
  const [nickName, setNickName] = useState(initialData?.nickName || "");
  const [rainDegree, setRainDegree] = useState<number | "">(initialData?.rainDegree || "");
  const [operator, setOperator] = useState(initialData?.operator || "greater");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [locationId, setLocationId] = useState<number | null>(initialData?.locationId || null);
  const [userId] = useState(initialData?.userId || 1); // 假設從用戶上下文中獲取 ID
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 啟用 hover 功能
    dispatch({ type: "SET_HOVER_ENABLED", payload: true });
    console.log("Hover enabled for map.");

    return () => {
      // 禁用 hover 功能
      dispatch({ type: "SET_HOVER_ENABLED", payload: false });
      console.log("Hover disabled for map.");
    };
  }, [dispatch]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 驗證
    if (!nickName || !rainDegree || !operator || !locationId) {
      setError("All fields are required.");
      return;
    }

    setError(null); // 清除錯誤
    setIsSubmitting(true);

    try {
      await onSubmit({
        nickName,
        rainDegree: Number(rainDegree),
        operator,
        isActive,
        userId,
        locationId,
      });
      console.log("Subscription Submitted Successfully!");
    } catch (err) {
      console.error("Submission failed:", err);
      setError("Failed to create or update subscription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* 返回按鈕 */}
      <Button color="secondary" onPress={onBack}>
        Back
      </Button>
      <Spacer y={1} />

      {/* 表單標題 */}
      <h2 className="text-xl font-bold mb-4">
        {initialData ? "Edit Subscription" : "Create New Subscription"}
      </h2>

      {/* 表單 */}
      <form onSubmit={handleSubmit}>
        {/* 訂閱名稱 */}
        <Input
          name="nickName"
          label="Subscription Name"
          placeholder="Enter subscription name"
          value={nickName}
          onChange={(e) => setNickName(e.target.value)}
          required
          fullWidth
        />
        <Spacer y={1} />

        {/* 雨量警報值 */}
        <Input
          name="rainDegree"
          type="number"
          label="Rainfall Degree"
          placeholder="Enter rainfall degree"
          value={rainDegree?.toString() || ""}
          onChange={(e) => setRainDegree(Number(e.target.value))}
          required
          fullWidth
          min={1}
        />
        <Spacer y={1} />

        {/* 運算符選擇 */}
        <Select
          label="Operator"
          placeholder="Select operator"
          selectedKeys={[operator]}
          onSelectionChange={(key) => setOperator(key as string)}
        >
          <SelectItem key="greater">Greater Than</SelectItem>
          <SelectItem key="less">Less Than</SelectItem>
        </Select>
        <Spacer y={1} />

        {/* 地點選擇 */}
        <Input
          name="locationId"
          type="number"
          label="Location ID"
          placeholder="Enter location ID"
          value={locationId?.toString() || ""}
          onChange={(e) => setLocationId(Number(e.target.value))}
          required
          fullWidth
          min={1}
        />
        <Spacer y={1} />

        {/* 錯誤訊息 */}
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {/* 提交按鈕 */}
        <Button type="submit" color="primary" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" /> : initialData ? "Update Subscription" : "Create Subscription"}
        </Button>
      </form>
    </div>
  );
};

export default CreateSubscription;
