"use client";

import { useActionState, useEffect, useId, useState } from "react";
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
import { massDisqualifyProjects } from "./actions";

export function MassDisqualifyModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    massDisqualifyProjects,
    null,
  );
  const [showMessage, setShowMessage] = useState(false);
  const id = useId();

  useEffect(() => {
    if (state?.error || state?.success) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        if (state?.success) {
          setOpen(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state]);

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

          {showMessage && state?.error && (
            <div className="text-sm text-red-500">{state.error}</div>
          )}
          {showMessage && state?.success && (
            <div className="text-sm text-green-500">
              Successfully disqualified {state.updated} project(s)!
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogTrigger>
            <Button type="submit" disabled={pending}>
              {pending ? "Processing..." : "Disqualify"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
