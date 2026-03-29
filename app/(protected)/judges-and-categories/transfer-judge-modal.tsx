"use client";

import { ArrowLeftRight } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transferJudgeToGroup } from "./actions";

interface TransferJudgeModalProps {
  judge: {
    id: string;
    name: string;
    judgeGroupId: number;
    judgeGroupName: string;
    categoryId: string;
  };
  availableGroups: {
    id: number;
    name: string;
    categoryId: string;
  }[];
  disabled?: boolean;
}

export function TransferJudgeModal({
  judge,
  availableGroups,
  disabled = false,
}: TransferJudgeModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const [state, formAction, pending] = useActionState(
    async (prevState: { success?: boolean; error?: string } | null) => {
      if (!selectedGroupId) {
        return { success: false, error: "Please select a target group" };
      }
      return transferJudgeToGroup({
        judgeId: judge.id,
        targetGroupId: parseInt(selectedGroupId, 10),
      });
    },
    null,
  );
  const [showMessage, setShowMessage] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.error || state?.success) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        if (state?.success) {
          setOpen(false);
          setSelectedGroupId("");
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const otherGroups = availableGroups.filter(
    (g) => g.id !== judge.judgeGroupId,
  );

  if (otherGroups.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={disabled}
          title={
            disabled
              ? "Cannot transfer: assignments exist"
              : `Transfer ${judge.name} to another group`
          }
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span className="sr-only">
            Transfer {judge.name} to another group
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106">
        <DialogHeader>
          <DialogTitle>Transfer Judge</DialogTitle>
          <DialogDescription>
            Move {judge.name} from group {judge.judgeGroupName} to another
            group.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Target Group
            </label>
            <Select
              value={selectedGroupId}
              onValueChange={setSelectedGroupId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target group" />
              </SelectTrigger>
              <SelectContent>
                {otherGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
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
              Judge transferred successfully!
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogTrigger>
            <Button type="submit" disabled={pending || !selectedGroupId}>
              {pending ? "Transferring..." : "Transfer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
