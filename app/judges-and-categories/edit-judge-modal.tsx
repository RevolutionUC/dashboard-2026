"use client";

import { Pencil } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
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
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (state?.error || state?.success) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
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
            <Label htmlFor="edit-judge-name">Name</Label>
            <Input
              id="edit-judge-name"
              name="name"
              defaultValue={judge.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-judge-email">Email</Label>
            <Input
              id="edit-judge-email"
              name="email"
              type="email"
              defaultValue={judge.email}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-judge-category">Category</Label>
            <Select name="categoryId" defaultValue={judge.categoryId}>
              <SelectTrigger id="edit-judge-category">
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

          {showMessage && state?.error && (
            <div className="text-sm text-red-500">{state.error}</div>
          )}
          {showMessage && state?.success && (
            <div className="text-sm text-green-500">
              Judge updated successfully!
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogTrigger>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
