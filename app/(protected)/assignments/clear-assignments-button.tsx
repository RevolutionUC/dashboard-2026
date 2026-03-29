"use client";

import { useTransition } from "react";
import { clearAllAssignmentsAction } from "./actions";

export function ClearAssignmentsButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all assignments? This will also delete all evaluations. This action cannot be undone.",
    );

    if (confirmed) {
      startTransition(async () => {
        await clearAllAssignmentsAction();
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 h-9 px-4 py-2"
    >
      {isPending ? "Clearing..." : "Clear all assignments"}
    </button>
  );
}
