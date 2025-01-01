"use client";

import React from "react";
import {
  Radio,
  RadioGroup,
  DatePicker,
  DateRangePicker,
} from "@nextui-org/react";
import { now, parseAbsoluteToLocal } from "@internationalized/date";

interface EventTypeSelectorProps {
  eventType: "fixedTimeSummary" | "anyTimeReport" | "periodReport";
  startTime: string;
  endTime: string | null;
  until: string | null;
  onEventTypeChange: (
    value: "fixedTimeSummary" | "anyTimeReport" | "periodReport"
  ) => void;
  onStartTimeChange: (date: string) => void;
  onEndTimeChange: (date: string | null) => void;
  onUntilChange: (date: string | null) => void;
}

const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({
  eventType,
  startTime,
  endTime,
  until,
  onEventTypeChange,
  onStartTimeChange,
  onEndTimeChange,
  onUntilChange,
}) => {
    const sanitizeDate = (date: string) => {
        if (!date) return date;
        // 移除 [時區名稱] 部分
        const sanitized = date.split("[")[0];
        return sanitized;
      };

  return (
    <div className="flex flex-col gap-4">
      {/* Event Type Radio Buttons */}
      <RadioGroup
        label="Event Type"
        value={eventType}
        onValueChange={(value) =>
          onEventTypeChange(
            value as "fixedTimeSummary" | "anyTimeReport" | "periodReport"
          )
        }
      >
        <Radio value="anyTimeReport">
          Notify me whenever there is a report
        </Radio>
        <Radio value="fixedTimeSummary">
          Notify me at a specific moment on a specific day
        </Radio>
        <Radio value="periodReport">
          Notify me between specific hours on a specific day
        </Radio>
      </RadioGroup>

      {/* Start Time or Date Range Picker */}
      <div className="flex gap-4">
        {eventType !== "periodReport" && (
          console.log("Selected Start Time:", startTime),
          <DatePicker
            fullWidth
            label="Start Time (Required)"
            placeholderValue={now("UTC")}
            value={parseAbsoluteToLocal(sanitizeDate(startTime))}
            onChange={(date) => {
              if (date) {
                onStartTimeChange(date.toString().split("[Asia/Taipei]")[0]);
              }
            }}
            disableAnimation={true} // 解決錯誤
            isRequired
          />
        )}
        {eventType === "periodReport" && (
          <DateRangePicker
          disableAnimation={true} // 解決動畫錯誤
          isRequired
          fullWidth
          granularity="hour"
          label="Start and End Time"
          value={{
            start: parseAbsoluteToLocal(sanitizeDate(startTime)),
            end: endTime
              ? parseAbsoluteToLocal(sanitizeDate(endTime))
              : parseAbsoluteToLocal(
                  sanitizeDate(
                    new Date(
                      new Date(sanitizeDate(startTime)).getTime() + 60 * 60 * 1000
                    ).toISOString()
                  )
                ), // 確保 endTime 比 startTime 多 1 小時
          }}
          onChange={(range) => {
            if (range?.start) {
              try {
                const sanitizedStartTime = sanitizeDate(range.start.toString());
                const parsedStartTime = new Date(sanitizedStartTime);
        
                if (!isNaN(parsedStartTime.getTime())) {
                  // 更新 startTime
                  onStartTimeChange(parsedStartTime.toISOString());
        
                  // 更新 endTime
                  if (range?.end) {
                    const sanitizedEndTime = sanitizeDate(range.end.toString());
                    const parsedEndTime = new Date(sanitizedEndTime);
                    if (!isNaN(parsedEndTime.getTime())) {
                      onEndTimeChange(parsedEndTime.toISOString());
                    } else {
                      console.error("Invalid time value for endTime:", sanitizedEndTime);
                    }
                  } else {
                    onEndTimeChange(null);
                  }
                } else {
                  console.error("Invalid time value for startTime:", sanitizedStartTime);
                }
              } catch (error) {
                console.error("Error parsing startTime:", error);
              }
            } else {
              console.error("Invalid time value for startTime in onChange:", range?.start);
            }
          }}
        />
        
        )}
      </div>

      {/* Until Date Picker */}
    <div>
      <DatePicker
        fullWidth
        label="Until (Optional)"
        granularity="day"
        placeholderValue={now("Asia/Taipei")}
        value={until ? parseAbsoluteToLocal(sanitizeDate(until)) : null}
        onChange={(date) => onUntilChange(date?.toString() || null)}
        disableAnimation={true} // 解決錯誤
      />
    </div>
    </div>
  );
};

export default EventTypeSelector;
