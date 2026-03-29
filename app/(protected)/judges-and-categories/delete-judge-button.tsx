"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteJudgeAction } from "./actions";

interface DeleteJudgeButtonProps {
  judgeId: string;
  judgeName: string;
}

export function DeleteJudgeButton({ judgeId, judgeName }: DeleteJudgeButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete judge "${judgeName}"?`,
    );

    if (confirmed) {
      startTransition(async () => {
        await deleteJudgeAction(judgeId);
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
      title={`Delete ${judgeName}`}
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete {judgeName}</span>
    </Button>
  );
}
