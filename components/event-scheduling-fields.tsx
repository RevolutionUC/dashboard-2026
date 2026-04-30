"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EventSchedulingValues {
  startTime: string;
  endTime: string;
  location: string;
  capacity: string;
}

interface EventSchedulingFieldsProps {
  values: EventSchedulingValues;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  idPrefix?: string;
  showEndTime?: boolean;
}

export function EventSchedulingFields({
  values,
  onChange,
  idPrefix = "",
  showEndTime = true,
}: EventSchedulingFieldsProps) {
  const id = (field: keyof EventSchedulingValues) => `${idPrefix}${field}`;

  return (
    <>
      <div className={`grid gap-4 ${showEndTime ? "grid-cols-2" : ""}`}>
        <div className="grid gap-2">
          <Label htmlFor={id("startTime")}>Start Time</Label>
          <Input
            id={id("startTime")}
            name="startTime"
            type="datetime-local"
            value={values.startTime}
            onChange={onChange}
          />
        </div>

        {showEndTime && (
          <div className="grid gap-2">
            <Label htmlFor={id("endTime")}>End Time</Label>
            <Input
              id={id("endTime")}
              name="endTime"
              type="datetime-local"
              value={values.endTime}
              onChange={onChange}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={id("location")}>Location</Label>
          <Input
            id={id("location")}
            name="location"
            value={values.location}
            onChange={onChange}
            placeholder="Enter location"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={id("capacity")}>Capacity</Label>
          <Input
            id={id("capacity")}
            name="capacity"
            type="number"
            min="1"
            value={values.capacity}
            onChange={onChange}
            placeholder="Max attendees"
          />
        </div>
      </div>
    </>
  );
}
