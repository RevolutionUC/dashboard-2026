"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteCategoryAction } from "./actions";

interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
}

export function DeleteCategoryButton({
  categoryId,
  categoryName,
}: DeleteCategoryButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete category "${categoryName}"? This will permanently delete all associated judges, judge groups, and evaluations. This action cannot be undone`,
    );

    if (confirmed) {
      startTransition(async () => {
        await deleteCategoryAction(categoryId);
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
      onClick={handleClick}
      disabled={isPending}
      title={`Delete ${categoryName}`}
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete {categoryName}</span>
    </Button>
  );
}
