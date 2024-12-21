"use client";

import React from "react";
import { Input, Button, Spacer } from "@nextui-org/react";

interface CreateSubscriptionProps {
  onBack: () => void; // 回上一頁的回調
  onSubmit: (data: any) => void; // 表單提交的回調
}

const CreateSubscription: React.FC<CreateSubscriptionProps> = ({
  onBack,
  onSubmit,
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      region: formData.get("region"),
      alertType: formData.get("alertType"),
    };
    onSubmit(data);
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
          required
          fullWidth
        />
        <Spacer y={1} />

        {/* 警報類型輸入 */}
        <Input
          name="alertType"
          label="Alert Type"
          placeholder="e.g., Rainfall"
          required
          fullWidth
        />
        <Spacer y={1.5} />

        {/* 提交按鈕 */}
        <Button type="submit" color="primary">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default CreateSubscription;
