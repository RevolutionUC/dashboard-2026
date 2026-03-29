"use client";

import { useTransition } from "react";
import { toggleJudgeCheckinAction } from "./actions";

interface JudgeCheckinCheckboxProps {
  judgeId: string;
  isCheckedin: boolean;
}

export function JudgeCheckinCheckbox({
  judgeId,
  isCheckedin: initialIsCheckedin,
}: JudgeCheckinCheckboxProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleJudgeCheckinAction(judgeId);
    });
  };

  return (
    <input
      type="checkbox"
      checked={initialIsCheckedin}
      onChange={handleToggle}
      disabled={isPending}
      className="h-4 w-4 rounded border-gray-300"
    />
  );
}
