"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EventNameFieldProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
}

export function EventNameField({
  id = "name",
  name = "name",
  value,
  onChange,
  label = "Event Name *",
  placeholder = "Enter event name",
}: EventNameFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
    </div>
  );
}
