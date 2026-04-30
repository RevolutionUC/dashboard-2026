import type React from "react";
import { toISOStringWithTimezone } from "@/lib/date-time";

export function updateStringField<T extends Record<string, string>>(
  previous: T,
  name: string,
  value: string,
): T {
  return { ...previous, [name]: value };
}

export function createStringFormHandlers<T extends Record<string, string>>(
  setValues: React.Dispatch<React.SetStateAction<T>>,
) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => updateStringField(prev, name, value));
  };

  const handleSelectChange = (name: string, value: string) => {
    setValues((prev) => updateStringField(prev, name, value));
  };

  return { handleInputChange, handleSelectChange };
}

export function toTimedPayload<T extends { startTime: string; endTime: string }>(
  values: T,
): T {
  return {
    ...values,
    startTime: values.startTime ? toISOStringWithTimezone(values.startTime) : "",
    endTime: values.endTime ? toISOStringWithTimezone(values.endTime) : "",
  };
}
