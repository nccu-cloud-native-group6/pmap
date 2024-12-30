"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@nextui-org/react";
import CreateSubscription from "./CreateSubscription";
import LoginPage from "./LoginPage";
import NoSubscriptionPage from "./NoSubscriptionPage";
import { useUser } from "../../contexts/UserContext";
import { Subscription } from "../../types/subscription";
import axios from "axios";
import { toast } from "react-toastify";

interface SlidingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SlidingPanel: React.FC<SlidingPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [editSubscription, setEditSubscription] = useState<Subscription | null>(
    null
  );

  const handleBack = () => {
    setIsCreating(false);
    setEditSubscription(null);
  };

  const handleCreateOrEditSubscription = (
    data: Omit<Subscription, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editSubscription) {
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === editSubscription.id
            ? { ...editSubscription, ...data }
            : sub
        )
      );
    } else {
      console.log(data);
      // since the data may not align with the API, we need to transform it
      const recurrenceMap: { [key: string]: string } = {
        none: "",
        daily: "RRULE:FREQ=DAILY",
        weekly: "RRULE:FREQ=WEEKLY",
        monthly: "RRULE:FREQ=MONTHLY",
      };

      // switch case to handle different event types
      let transformedData;
      switch (data.eventType) {
        case "fixedTimeSummary":
          transformedData = {
            location: {
              latlng: {
                lat: data.location.lat,
                lng: data.location.lng,
              },
              address: data.address,
            },
            selectedPolygonsIds: data.locationId,
            nickName: data.nickName,
            userId: user?.id,
            subEvents: [
              {
                time: {
                  type: data.eventType,
                  startTime: data.startTime,
                  recurrence: recurrenceMap[data.recurrence] || "",
                  until: data.until,
                },
              },
            ],
          };
          break;
        case "anyTimeReport":
          // if data.condition is empty:
          if (data.conditions.length === 0) {
            transformedData = {
              location: {
                latlng: {
                  lat: data.location.lat,
                  lng: data.location.lng,
                },
                address: data.address,
              },
              selectedPolygonsIds: data.locationId,
              nickName: data.nickName,
              userId: user?.id,
              subEvents: [
                {
                  time: {
                    type: data.eventType,
                    startTime: data.startTime,
                  },
                },
              ],
            };
          } else {
            transformedData = {
              location: {
              latlng: {
                lat: data.location.lat,
                lng: data.location.lng,
              },
              address: data.address,
              },
              selectedPolygonsIds: data.locationId,
              nickName: data.nickName,
              userId: user?.id,
              subEvents: data.conditions.map((condition) => ({
              time: {
                type: data.eventType,
                startTime: data.startTime,
              },
              rain: {
                value: condition.value,
                operator: condition.operator === ">" ? "gte" : "lte", // 將前端的操作符轉換為後端需求
              },
              })),
            };
            console.log(transformedData);
          }
          break;
        case "periodReport":
          transformedData = {
            location: {
              latlng: {
                lat: data.location.lat,
                lng: data.location.lng,
              },
              address: data.address,
            },
            selectedPolygonsIds: data.locationId,
            nickName: data.nickName,
            userId: user?.id,
            subEvents: [
              {
                time: {
                  type: data.eventType,
                  startTime: data.startTime,
                  endTime: data.endTime,
                  recurrence: recurrenceMap[data.recurrence] || "",
                  until: data.until,
                },
              },
            ],
          };
          break;
      }

      axios
        .post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}/subscriptions`,
          transformedData,
          {
            headers: {
              Authorization: `Bearer ${user?.access_token}`,
            },
          }
        )
        .then((res) => {
          setSubscriptions((prev) => [
            ...prev,
            {
              ...data,
              id: res.data.data.newSubscriptionId,
              createdAt: new Date(),
            },
          ]);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to create subscription", {
            position: "top-left",
          });
        });
    }
    setIsCreating(false);
    setEditSubscription(null);
  };

  // call api to get subscriptions
  useEffect(() => {
    if (user) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}/subscriptions`, {
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
        })
        .then((res) => {
          setSubscriptions(res.data);
          console.log(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [user]);

  const handleDelete = (id: number) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
    console.log(id);
    axios
      .delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}/subscriptions/${id}`,
        {
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
        }
      )
      .then((res) => {
        // use react-toastify to show success message
        toast.success("Subscription deleted successfully", {
          position: "top-left",
        });
      })
      .catch((err) => {
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
                <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[calc(100vh-250px)]">
                  {subscriptions.map((sub) => (
                    <Card
                      key={sub.id}
                      isHoverable
                      className="rounded-lg shadow-md"
                    >
                      <CardHeader>
                        <h3 className="font-semibold">{sub.nickName} <br/> {sub.location.address}</h3>
                      </CardHeader>
                      <CardBody>
                        <p className="text-sm text-gray-600">
                          <strong>Created At:</strong>{" "}
                          {sub.createdAt?.toLocaleString() || "N/A"}
                        </p>
                      </CardBody>
                      <CardFooter className="flex justify-end gap-2">
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
