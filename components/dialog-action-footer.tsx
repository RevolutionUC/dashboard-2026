"use client";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";

interface DialogActionFooterProps {
  pending: boolean;
  pendingLabel: string;
  submitLabel: string;
  submitDisabled?: boolean;
}

export function DialogActionFooter({
  pending,
  pendingLabel,
  submitLabel,
  submitDisabled = false,
}: DialogActionFooterProps) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          Cancel
        </Button>
      </DialogTrigger>
      <Button type="submit" disabled={pending || submitDisabled}>
        {pending ? pendingLabel : submitLabel}
      </Button>
    </div>
  );
}
