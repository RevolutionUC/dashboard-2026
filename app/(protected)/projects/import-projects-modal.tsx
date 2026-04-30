"use client";

import { Upload } from "lucide-react";
import { useId } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormActionDialogState } from "@/hooks/use-form-action-dialog-state";
import { importProjectsFromDevpost } from "./actions";

interface ImportProjectsModalProps {
  projectsCount: number;
}

export function ImportProjectsModal({
  projectsCount,
}: ImportProjectsModalProps) {
  const { open, setOpen, state, formAction, pending, showMessage } =
    useFormActionDialogState(importProjectsFromDevpost);
  const id = useId();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Import from Devpost
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Import Projects from Devpost</DialogTitle>
          <DialogDescription>
            Upload a CSV file exported from Devpost to import projects. This
            will replace all existing {projectsCount} project(s) and their
            submissions.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-file`}>Devpost CSV File</Label>
            <Input
              id={`${id}-file`}
              name="csvFile"
              type="file"
              accept=".csv"
              required
            />
            <p className="text-xs text-muted-foreground">
              Upload the CSV file exported from Devpost containing all project
              submissions.
            </p>
          </div>

          <ActionStateMessage
            show={showMessage}
            error={state?.error}
            success={state?.success}
            successText={`Successfully imported ${state?.imported ?? 0} project(s)${
              (state?.skipped ?? 0) > 0 ? ` (skipped ${state?.skipped} draft project(s))` : ""
            }!`}
          />

          <DialogActionFooter
            pending={pending}
            pendingLabel="Importing..."
            submitLabel="Import Projects"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
