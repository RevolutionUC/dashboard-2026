"use client";

import { Pencil } from "lucide-react";
import { useActionState, useId } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTimedActionMessage } from "@/hooks/use-timed-action-message";
import { type CategoryType, updateJudgeAction } from "./actions";

interface EditJudgeModalProps {
  judge: {
    id: string;
    name: string;
    email: string;
    categoryId: string;
    categoryName: string;
  };
  categories: {
    id: string;
    name: string;
    type: CategoryType;
  }[];
}

export function EditJudgeModal({ judge, categories }: EditJudgeModalProps) {
  const [state, formAction, pending] = useActionState(updateJudgeAction, null);
  const showMessage = useTimedActionMessage(state, {
    durationMs: 1000,
  });
  const id = useId();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title={`Edit ${judge.name}`}
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit {judge.name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106">
        <DialogHeader>
          <DialogTitle>Edit Judge</DialogTitle>
          <DialogDescription>
            Update judge details for {judge.name}.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={judge.id} />

          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>Name</Label>
            <Input
              id={`${id}-name`}
              name="name"
              defaultValue={judge.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-email`}>Email</Label>
            <Input
              id={`${id}-email`}
              name="email"
              type="email"
              defaultValue={judge.email}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-category`}>Category</Label>
            <Select name="categoryId" defaultValue={judge.categoryId}>
              <SelectTrigger id={`${id}-category`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ActionStateMessage
            show={showMessage}
            error={state?.error}
            success={state?.success}
            successText="Judge updated successfully!"
          />

          <DialogActionFooter
            pending={pending}
            pendingLabel="Saving..."
            submitLabel="Save Changes"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
