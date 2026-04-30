"use client";

import { useId, useRef, useState } from "react";

export function useTwoModeCreateState() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const singleFormRef = useRef<HTMLFormElement>(null);
  const bulkFormRef = useRef<HTMLFormElement>(null);

  return {
    open,
    setOpen,
    id,
    singleFormRef,
    bulkFormRef,
  };
}
