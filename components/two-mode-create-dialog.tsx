"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TwoModeCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerLabel: string;
  title: string;
  description: string;
  singleTabLabel: string;
  bulkTabLabel: string;
  singleContent: React.ReactNode;
  bulkContent: React.ReactNode;
}

export function TwoModeCreateDialog({
  open,
  onOpenChange,
  triggerLabel,
  title,
  description,
  singleTabLabel,
  bulkTabLabel,
  singleContent,
  bulkContent,
}: TwoModeCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="single" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">{singleTabLabel}</TabsTrigger>
            <TabsTrigger value="bulk">{bulkTabLabel}</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-4">
            {singleContent}
          </TabsContent>

          <TabsContent value="bulk" className="mt-4">
            {bulkContent}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
