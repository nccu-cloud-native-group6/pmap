"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";
import CreateSubscription from "./CreateSubscription";
import LoginPage from "./LoginPage";
import NoSubscriptionPage from "./NoSubscriptionPage";
import { useUser } from "../../contexts/UserContext";
import { Subscription } from "../../types/subscription";
import  axios   from "axios";

interface SlidingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SlidingPanel: React.FC<SlidingPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [editSubscription, setEditSubscription] = useState<Subscription | null>(null);

  const handleBack = () => {
    setIsCreating(false);
    setEditSubscription(null);
  };

  const handleCreateOrEditSubscription = (data: Omit<Subscription, "id" | "createdAt" | "updatedAt">) => {
    if (editSubscription) {
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === editSubscription.id ? { ...editSubscription, ...data } : sub))
      );
    } else {
      setSubscriptions((prev) => [
        ...prev,
        { ...data, id: Date.now(), createdAt: new Date() },
      ]);
    }
    setIsCreating(false);
    setEditSubscription(null);
  };

  // call api to get subscriptions
  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:3000/api/users/${user?.id}/subscriptions`, {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
      }).then((res) => {
        setSubscriptions(res.data);
        console.log(res.data);
      }).catch((err) => {
        console.error(err);
      });
    }
  }, [user]);

  const handleDelete = (id: number) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
     axios.delete(`http://localhost:3000/api/users/${user?.id}/subscriptions/${id}`, {
      headers: {
        Authorization: `Bearer ${user?.access_token}`,
      },
    }).then((res) => {
      console.log(res.data);
    }
    ).catch((err) => {
      console.error(err);
    });
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
        <div className="relative h-full">
          {/* 如果未登入，顯示 LoginPage */}
          {!user ? (
            <LoginPage />
          ) : isCreating || editSubscription ? (
            <CreateSubscription
              onBack={handleBack}
              onSubmit={handleCreateOrEditSubscription}
              initialData={editSubscription || undefined}
            />
          ) : (
            <div className="p-6 overflow-y-auto">
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
                      className="rounded-lg shadow-md"
                    >
                      <CardHeader>
                        <h3 className="font-semibold">{sub.nickName}</h3>
                      </CardHeader>
                      <CardBody>
                        <p className="text-sm text-gray-600">
                          <strong>Type:</strong> {sub.eventType}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Created At:</strong>{" "}
                          {sub.createdAt?.toLocaleString() || "N/A"}
                        </p>
                      </CardBody>
                      <CardFooter className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          onPress={() => handleEdit(sub)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          onPress={() => handleDelete(sub.id)}
                        >
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {/* 創建訂閱按鈕 */}
              {subscriptions.length > 0 && (
                <div className="mt-6">
                  <Button
                    color="primary"
                    onPress={() => setIsCreating(true)}
                  >
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
