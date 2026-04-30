"use client";

import { useActionState, useState } from "react";
import { useTimedActionMessage } from "@/hooks/use-timed-action-message";

interface ActionStateShape {
  error?: string;
  success?: boolean;
}

interface FormActionDialogOptions {
  durationMs?: number;
}

export function useFormActionDialogState<TState extends ActionStateShape>(
  action: (state: TState | null, formData: FormData) => Promise<TState>,
  options: FormActionDialogOptions = {},
) {
  const { durationMs } = options;
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, null);
  const showMessage = useTimedActionMessage(state, {
    durationMs,
    onSuccess: () => setOpen(false),
  });

  return {
    open,
    setOpen,
    state,
    formAction,
    pending,
    showMessage,
  };
}
