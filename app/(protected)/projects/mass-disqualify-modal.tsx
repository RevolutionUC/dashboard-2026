"use client";

import { useActionState, useId, useState } from "react";
import { ActionStateMessage } from "@/components/action-state-message";
import { DialogActionFooter } from "@/components/dialog-action-footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTimedActionMessage } from "@/hooks/use-timed-action-message";
import { massDisqualifyProjects } from "./actions";

export function MassDisqualifyModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    massDisqualifyProjects,
    null,
  );
  const showMessage = useTimedActionMessage(state, {
    onSuccess: () => setOpen(false),
  });
  const id = useId();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Mass Disqualify
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mass Disqualify Projects</DialogTitle>
          <DialogDescription>
            Format: project_name,disqualify_reason (no headers needed)
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-csv`}>CSV Content</Label>
            <Textarea
              id={`${id}-csv`}
              name="csvContent"
              placeholder="Project A,Used someone else code"
              rows={8}
              required
            />
            <p className="text-xs text-muted-foreground">
              Format: project_name,disqualify_reason (no headers needed)
            </p>
          </div>

          <ActionStateMessage
            show={showMessage}
            error={state?.error}
            success={state?.success}
            successText={`Successfully disqualified ${state?.updated ?? 0} project(s)!`}
          />

          <DialogActionFooter
            pending={pending}
            pendingLabel="Processing..."
            submitLabel="Disqualify"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
