"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface SubmitCancelFooterProps {
  isSubmitting: boolean;
  onCancel: () => void;
  submitLabel: string;
  submittingLabel: string;
}

export function SubmitCancelFooter({
  isSubmitting,
  onCancel,
  submitLabel,
  submittingLabel,
}: SubmitCancelFooterProps) {
  return (
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </DialogFooter>
  );
}
