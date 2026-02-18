"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
}

export function CategoryFilter({
  categories,
  selectedCategory,
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`/cagetoryScorings?${params.toString()}`);
  };

  return (
    <Select
      value={selectedCategory || "all"}
      onValueChange={handleCategoryChange}
    >
      <SelectTrigger className="w-75">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
