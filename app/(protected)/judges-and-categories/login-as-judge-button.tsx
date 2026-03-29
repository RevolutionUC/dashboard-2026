"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LoginAsJudgeButtonProps {
  judgeId: string;
  judgeName: string;
}

export function LoginAsJudgeButton({
  judgeId,
  judgeName,
}: LoginAsJudgeButtonProps) {
  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
      <Link
        href={`/judgingportal/${judgeId}`}
        target="_blank"
        title={`Log in as ${judgeName}`}
      >
        <LogIn className="h-4 w-4" />
        <span className="sr-only">Log in as {judgeName}</span>
      </Link>
    </Button>
  );
}
