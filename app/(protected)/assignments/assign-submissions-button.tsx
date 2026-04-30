"use client";

import { Plus } from "lucide-react";
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
import { assignProjectsToJudgeGroups } from "./actions";

export function AssignSubmissionsButton() {
  const { open, setOpen, state, formAction, pending, showMessage } =
    useFormActionDialogState(assignProjectsToJudgeGroups, {
    durationMs: 2000,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Assign Projects to Judge Groups
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Assign Projects to Judge Groups</DialogTitle>
          <DialogDescription>
            This will automatically assign all project submissions to judge
            groups based on categories. Each project will be assigned to at
            least 6 judges total.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minimum-judges-input">Minimum Judges per Project</Label>
            <Input
              id="minimum-judges-input"
              name="minimumJudges"
              type="number"
              min="1"
              defaultValue="6"
              required
            />
          </div>

          <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Assignment Logic:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Projects are assigned to judge groups of matching categories
              </li>
              <li>Sponsor projects: 1 judge group</li>
              <li>Inhouse projects: 2 judge groups</li>
              <li>General projects: 1 judge group</li>
              <li>
                Additional General judges added to reach minimum of 6 judges per
                project
              </li>
            </ul>
          </div>

          <ActionStateMessage
            show={showMessage}
            error={state?.error}
            success={state?.success}
            successText={`Successfully created ${state?.count ?? 0} assignment(s) for ${
              state?.projectsAssigned ?? 0
            } project(s)!`}
          />

          <DialogActionFooter
            pending={pending}
            pendingLabel="Assigning..."
            submitLabel="Assign Projects"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
