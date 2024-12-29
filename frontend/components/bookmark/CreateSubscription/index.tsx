import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Spacer,
  Spinner,
  Slider,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useMap } from "../../../contexts/MapContext";
import { Subscription } from "../../../types/subscription";
import { Location } from "../../../types/location";
import LocationDisplay from "./Location";
import ConditionBuilder from "./Condition";
import EventTypeSelector from "./EventTypeSelector";

interface SubscriptionFormProps {
  onBack: () => void;
  onSubmit: (data: Omit<Subscription, "id" | "createdAt">) => void;
  initialData?: Omit<Subscription, "id" | "createdAt">;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  onBack,
  onSubmit,
  initialData,
}) => {
  const { state, dispatch } = useMap();

  const [nickName, setNickName] = useState(initialData?.nickName || "");
  const [rainDegree, setRainDegree] = useState<number | "">(initialData?.rainDegree || "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [userId] = useState(initialData?.userId || 1);
  const [eventType, setEventType] = useState<"fixedTimeSummary" | "anyTimeReport" | "periodReport">(initialData?.eventType || "anyTimeReport");
  const [startTime, setStartTime] = useState(initialData?.startTime || new Date().toISOString());
  const [endTime, setEndTime] = useState(initialData?.endTime || null);
  const [until, setUntil] = useState(initialData?.until || null);
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly" | "monthly">(initialData?.recurrence || "none");
  const [conditions, setConditions] = useState<{ operator: ">" | "<"; value: number; id: number }[]>(initialData?.conditions?.map(condition => ({ ...condition, id: Number(condition.id) })) || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLocation: Location = state.selectedLocation as Location;

  // resrt form function
  const resetForm = () => {
    setNickName("");
    setRainDegree("");
    setIsActive(true);
    setEventType("anyTimeReport");
    setStartTime(new Date().toISOString());
    setEndTime(null);
    setUntil(null);
    setRecurrence("none");
    setConditions([]);
    setError(null);
    state.selectedLocation = { lat: 0, lng: 0 };
    state.selectedIds = [];
  }

  //useEffect to reset form
  useEffect(() => {
    if (!initialData) {
      resetForm();
    }
  }, [initialData]);

  useEffect(() => {
    dispatch({ type: "SET_HOVER_ENABLED", payload: true });

    return () => {
      dispatch({ type: "SET_HOVER_ENABLED", payload: false });
    };
  }, [dispatch]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!nickName || !eventType || !startTime) {
      setError("All required fields must be filled.");
      return;
    }

    if (!selectedLocation || !selectedLocation.lat || !selectedLocation.lng) {
      setError("Location must be selected.");
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
        isActive,
        userId,
        eventType,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : undefined,
        until: until ? new Date(until) : null,
        recurrence,
        operator: initialData?.operator || ">",
        locationId: state.selectedIds,
        location: selectedLocation,
        conditions,
        address: state.selectedAdress,
        subEvents: undefined
      });
    } catch (err) {
      console.error("Submission failed:", err);
      setError("Failed to create or update subscription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 flex flex-col create-subscription-container">
      <Button color="secondary" onPress={onBack}>
        Back
      </Button>
      <Spacer y={1} />

      <h2 className="text-xl font-bold mb-4">
        {initialData ? "Edit Subscription" : "Create New Subscription"}
      </h2>

      <div className="create-subscription-scrollable">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 地址顯示 */}
          <LocationDisplay location={selectedLocation} />

          {/* 名稱輸入 */}
          <Input
            name="nickName"
            label="Subscription Name"
            placeholder="Enter subscription name"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            isRequired
            fullWidth
          />

          {/* 雨量輸入 */}
          <ConditionBuilder
            conditions={conditions}
            onChange={setConditions}
          />

          {/* 深度滑桿 */}
          <Slider
            label="Range"
            defaultValue={state.depth}
            minValue={0}
            maxValue={5}
            step={1}
            showSteps={true}
            onChange={(value) => {
              dispatch({
                type: "SET_DEPTH",
                payload: Array.isArray(value) ? value[0] : value,
              });
            }}
          />

          {/* 報告類型 */}
          <EventTypeSelector
            eventType={eventType}
            startTime={typeof startTime === "string" ? startTime : startTime.toISOString()}
            endTime={endTime ? endTime.toISOString() : null}
            until={until ? until.toISOString() : null}
            onEventTypeChange={setEventType}
            onStartTimeChange={setStartTime}
            onEndTimeChange={(date) => setEndTime(date ? new Date(date) : null)}
            onUntilChange={(date) => setUntil(date ? new Date(date) : null)}
          />

          {(eventType === "fixedTimeSummary" ||
            eventType === "periodReport") && (
            <Select
              label="Recurrence"
              placeholder="Choose recurrence (Optional)"
              selectionMode="single"
              selectedKeys={recurrence ? [recurrence] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                setRecurrence(
                  selected as "none" | "daily" | "weekly" | "monthly"
                );
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
            {isSubmitting ? (
              <Spinner size="sm" />
            ) : initialData ? (
              "Update Subscription"
            ) : (
              "Create Subscription"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionForm;
