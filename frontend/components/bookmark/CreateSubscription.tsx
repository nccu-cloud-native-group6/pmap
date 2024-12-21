"use client";

import React, { useState, useEffect } from "react";
import { Input, Button, Spacer, Spinner } from "@nextui-org/react";
import { useMap } from "../../contexts/MapContext"; // 假設這是用於控制地圖狀態的 Context

interface CreateSubscriptionProps {
  onBack: () => void; // 回上一頁的回調
  onSubmit: (data: { region: string; alertType: string }) => void; // 表單提交的回調
}

const CreateSubscription: React.FC<CreateSubscriptionProps> = ({
  onBack,
  onSubmit,
}) => {
  const { dispatch } = useMap(); // 使用 MapContext 來控制 hover 功能
  const [region, setRegion] = useState("");
  const [alertType, setAlertType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading 狀態
  const [error, setError] = useState<string | null>(null); // 錯誤訊息

  useEffect(() => {
    // 啟用 hover 功能
    dispatch({ type: "SET_HOVER_ENABLED", payload: true });
    console.log("Hover enabled for map.");

    return () => {
      // 清理：禁用 hover 功能
      dispatch({ type: "SET_HOVER_ENABLED", payload: false });
      console.log("Hover disabled for map.");
    };
  }, [dispatch]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 簡單驗證
    if (!region || !alertType) {
      setError("Both fields are required.");
      return;
    }

    setError(null); // 清除錯誤
    setIsSubmitting(true); // 設置為提交中

    try {
      await onSubmit({ region, alertType }); // 模擬提交
      console.log("Submitted successfully!");
    } catch (err) {
      console.error("Submission failed:", err);
      setError("Failed to submit. Please try again."); // 設置錯誤訊息
    } finally {
      setIsSubmitting(false); // 結束提交狀態
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
      <h2 className="text-xl font-bold mb-4">Create New Subscription</h2>

      {/* 表單 */}
      <form onSubmit={handleSubmit}>
        {/* 地區輸入 */}
        <Input
          name="region"
          label="Region"
          placeholder="Enter the region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          required
          fullWidth
        />
        <Spacer y={1} />

        {/* 警報類型輸入 */}
        <Input
          name="alertType"
          label="Alert Type"
          placeholder="e.g., Rainfall"
          value={alertType}
          onChange={(e) => setAlertType(e.target.value)}
          required
          fullWidth
        />
        <Spacer y={1.5} />

        {/* 錯誤訊息 */}
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {/* 提交按鈕 */}
        <Button type="submit" color="primary" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" /> : "Submit"}
        </Button>
      </form>
    </div>
  );
};

export default CreateSubscription;
