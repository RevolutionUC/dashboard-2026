"use client";

import { Presentation, UtensilsCrossed } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EventTypeSelectProps {
  id: string;
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
}

export function EventTypeSelect({ id, label = "Event Type *", value, onValueChange }: EventTypeSelectProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select event type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="WORKSHOP">
            <span className="flex items-center gap-2">
              <Presentation className="h-3.5 w-3.5 text-violet-500" />
              Workshop
            </span>
          </SelectItem>
          <SelectItem value="FOOD">
            <span className="flex items-center gap-2">
              <UtensilsCrossed className="h-3.5 w-3.5 text-orange-500" />
              Food
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
