"use client";

import React from "react";
import { Button } from "@nextui-org/react";

interface NoSubscriptionPageProps {
  onCreate: () => void; // 回調函式，用於創建訂閱
}

const NoSubscriptionPage: React.FC<NoSubscriptionPageProps> = ({ onCreate }) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center h-full w-full">
        <h2 className="text-3xl font-bold text-center mb-6">No Subscription</h2>
        <p className="text-center mb-10 px-4">
        You haven't created any subscriptions yet. Click below to start!
      </p>
      <Button color="primary" onPress={onCreate}>
        Create Subscription
      </Button>
      </div>
    </div>
  );
};

export default NoSubscriptionPage;
