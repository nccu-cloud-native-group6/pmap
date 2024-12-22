"use client";

import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Spacer,
  Spinner,
  SelectItem,
  Select,
} from "@nextui-org/react";
import { now } from "@internationalized/date";
import { useMap } from "../../../contexts/MapContext";
import { Subscription } from "../../../types/subscription";
import EventTypeSelector from "./EventTypeSelector";

interface CreateSubscriptionProps {
  onBack: () => void;
  onSubmit: (
    data: Omit<Subscription, "id" | "createdAt" | "updatedAt"> & {
      startTime: string;
      endTime?: string;
      until?: string;
      recurrence?: string;
    }
  ) => void;
  initialData?: Omit<Subscription, "id" | "createdAt" | "updatedAt"> & { startTime?: string, endTime?: string, until?: string };
}

const CreateSubscription: React.FC<CreateSubscriptionProps> = ({
  onBack,
  onSubmit,
  initialData,
}) => {
  const { dispatch } = useMap();

  const [nickName, setNickName] = useState(initialData?.nickName || "");
  const [rainDegree, setRainDegree] = useState<number | "">(initialData?.rainDegree || "");
  const [operator, setOperator] = useState(initialData?.operator || "greater");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [locationId, setLocationId] = useState<number | null>(initialData?.locationId || null);
  const [userId] = useState(initialData?.userId || 1);
  const [eventType, setEventType] = useState<"fixedTimeSummary" | "anyTimeReport" | "periodReport">(
    initialData?.eventType || "anyTimeReport"
  );
  const [startTime, setStartTime] = useState(initialData?.startTime || now("UTC").toString());
  const [endTime, setEndTime] = useState(initialData?.endTime || null);
  const [until, setUntil] = useState(initialData?.until || null);
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly" | "monthly">("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch({ type: "SET_HOVER_ENABLED", payload: true });

    return () => {
      dispatch({ type: "SET_HOVER_ENABLED", payload: false });
    };
  }, [dispatch]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!nickName || !rainDegree || !operator || !locationId || !eventType || !startTime) {
      setError("All required fields must be filled.");
      return;
    }

    if (eventType === "periodReport" && !endTime) {
      setError("End Time is required for Period Report.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        nickName,
        rainDegree: Number(rainDegree),
        operator,
        isActive,
        userId,
        locationId,
        eventType,
        startTime,
        endTime: endTime || undefined,
        until: until || undefined,
        recurrence: eventType !== "anyTimeReport" && recurrence !== "none" ? recurrence : undefined,
      });
    } catch (err) {
      console.error("Submission failed:", err);
      setError("Failed to create or update subscription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <Button color="secondary" onPress={onBack}>
        Back
      </Button>
      <Spacer y={1} />

      <h2 className="text-xl font-bold mb-4">
        {initialData ? "Edit Subscription" : "Create New Subscription"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="nickName"
          label="Subscription Name"
          placeholder="Enter subscription name"
          value={nickName}
          onChange={(e) => setNickName(e.target.value)}
          isRequired
          fullWidth
        />
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
        <Select
          label="Operator"
          placeholder="Select operator"
          selectionMode="single"
          selectedKeys={operator ? [operator] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            setOperator(selected as string);
          }}
        >
          <SelectItem key="greater">Greater Than</SelectItem>
          <SelectItem key="less">Less Than</SelectItem>
        </Select>
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
        <EventTypeSelector
          eventType={eventType}
          startTime={startTime}
          endTime={endTime}
          until={until}
          onEventTypeChange={setEventType}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          onUntilChange={setUntil}
        />

        {(eventType === "fixedTimeSummary" || eventType === "periodReport") && (
          <Select
            label="Recurrence"
            placeholder="Choose recurrence (Optional)"
            selectionMode="single"
            selectedKeys={recurrence ? [recurrence] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              setRecurrence(selected as "none" | "daily" | "weekly" | "monthly");
            }}
            fullWidth
          >
            <SelectItem key="none">None</SelectItem>
            <SelectItem key="daily">Daily</SelectItem>
            <SelectItem key="weekly">Weekly</SelectItem>
            <SelectItem key="monthly">Monthly</SelectItem>
          </Select>
        )}

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <Button type="submit" color="primary" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" /> : initialData ? "Update Subscription" : "Create Subscription"}
        </Button>
      </form>
    </div>
  );
};

export default CreateSubscription;
