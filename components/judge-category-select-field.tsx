"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JudgeCategory {
  id: string;
  name: string;
  type: string;
}

interface JudgeCategorySelectFieldProps {
  id: string;
  categories: JudgeCategory[];
  name?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

export function JudgeCategorySelectField({
  id,
  categories,
  name = "categoryId",
  value,
  onValueChange,
  defaultValue,
}: JudgeCategorySelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Category</Label>
      <Select
        name={name}
        value={value}
        onValueChange={onValueChange}
        defaultValue={defaultValue}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name} ({category.type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
