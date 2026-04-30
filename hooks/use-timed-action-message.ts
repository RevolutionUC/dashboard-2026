"use client";

import { useEffect, useState } from "react";

interface TimedActionState {
  error?: string;
  success?: boolean;
}

interface UseTimedActionMessageOptions {
  durationMs?: number;
  onSuccess?: () => void;
}

export function useTimedActionMessage(
  state: TimedActionState | null,
  { durationMs = 1500, onSuccess }: UseTimedActionMessageOptions = {},
) {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (state?.error || state?.success) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        if (state?.success) {
          onSuccess?.();
        }
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [state, durationMs, onSuccess]);

  return showMessage;
}
