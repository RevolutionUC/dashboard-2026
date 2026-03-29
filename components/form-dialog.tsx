"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  maxWidth?: string;
}

export function FormDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  maxWidth = "sm:max-w-125",
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={maxWidth}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

interface FormFooterProps {
  isLoading: boolean;
  onCancel: () => void;
  submitLabel: string;
  loadingLabel: string;
}

export function FormFooter({
  isLoading,
  onCancel,
  submitLabel,
  loadingLabel,
}: FormFooterProps) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? loadingLabel : submitLabel}
      </Button>
    </div>
  );
}

interface FormMessageProps {
  error?: string | null;
  success?: string | null;
}

export function FormMessage({ error, success }: FormMessageProps) {
  if (error) return <div className="text-sm text-red-500">{error}</div>;
  if (success) return <div className="text-sm text-green-500">{success}</div>;
  return null;
}
