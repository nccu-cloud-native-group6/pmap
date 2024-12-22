"use client";

import React, { useState, useEffect } from "react";
import { Input, Button, Spacer, Spinner } from "@nextui-org/react";
import { useMap } from "../../contexts/MapContext";

interface CreateSubscriptionProps {
  onBack: () => void; // 回上一頁的回調
  onSubmit: (data: { region: string; alertType: string; depth: number }) => void; // 表單提交的回調
}

const CreateSubscription: React.FC<CreateSubscriptionProps> = ({
  onBack,
  onSubmit,
}) => {
  const { dispatch } = useMap(); // 使用 MapContext 來控制 hover 和範圍
  const [region, setRegion] = useState("");
  const [alertType, setAlertType] = useState("");
  const [depth, setDepth] = useState(1); // 默認高亮層數
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading 狀態
  const [error, setError] = useState<string | null>(null); // 錯誤訊息

  useEffect(() => {
    // 啟用 hover 功能
    dispatch({ type: "SET_HOVER_ENABLED", payload: true });

    // 將 depth 設定到 Context
    dispatch({ type: "SET_DEPTH", payload: depth });

    return () => {
      // 清理：禁用 hover 功能
      dispatch({ type: "SET_HOVER_ENABLED", payload: false });
    };
  }, [dispatch, depth]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 簡單驗證
    if (!region || !alertType || depth <= 0) {
      setError("All fields are required, and depth must be greater than 0.");
      return;
    }

    setError(null); // 清除錯誤
    setIsSubmitting(true); // 設置為提交中

    try {
      // 設定 depth 到 Context，確保地圖更新
      dispatch({ type: "SET_DEPTH", payload: depth });

      await onSubmit({ region, alertType, depth }); // 提交數據
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
        <Spacer y={1} />

        {/* 高亮層數輸入 */}
        <Input
          type="number"
          name="depth"
          label="Highlight Depth"
          placeholder="Enter highlight depth"
          value={depth.toString()}
          onChange={(e) => setDepth(Number(e.target.value))}
          required
          fullWidth
          min={0}
          max={5}
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
