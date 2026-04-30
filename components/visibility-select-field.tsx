"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VisibilitySelectFieldProps {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
}

export function VisibilitySelectField({
  id,
  value,
  onValueChange,
  label = "Visibility *",
}: VisibilitySelectFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select visibility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="public">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Public
            </span>
          </SelectItem>
          <SelectItem value="internal">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Internal
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
