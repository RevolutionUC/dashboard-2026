"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CategoryTypeSelectFieldProps {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  types: readonly string[];
}

export function CategoryTypeSelectField({
  id,
  value,
  onValueChange,
  types,
}: CategoryTypeSelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Type</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {types.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
