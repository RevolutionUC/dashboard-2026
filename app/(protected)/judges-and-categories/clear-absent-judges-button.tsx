"use client";

import { useTransition } from "react";
import { deleteAbsentJudgesAction } from "./actions";

export function ClearAbsentJudgesButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all judges who have not checked in? This action cannot be undone.",
    );

    if (confirmed) {
      startTransition(async () => {
        await deleteAbsentJudgesAction();
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 h-9 px-4 py-2"
    >
      {isPending ? "Deleting..." : "Clear absent judges"}
    </button>
  );
}
