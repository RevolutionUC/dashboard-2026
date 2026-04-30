"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EventNameField } from "@/components/event-name-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormErrorAlert } from "@/components/form-error-alert";
import { EventSchedulingFields } from "@/components/event-scheduling-fields";
import { SubmitCancelFooter } from "@/components/submit-cancel-footer";
import { VisibilitySelectField } from "@/components/visibility-select-field";
import { postJson } from "@/lib/client-api";
import { createStringFormHandlers, toTimedPayload } from "@/lib/form-utils";
import { Plus } from "lucide-react";

interface CreateEventDialogProps {
  onEventCreated: () => void;
}

export function CreateEventDialog({ onEventCreated }: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    location: "",
    capacity: "",
    visibility: "public",
  });
  const { handleInputChange, handleSelectChange } = createStringFormHandlers(setFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = toTimedPayload(formData);
      await postJson("/api/day-of-schedule", payload, "Failed to create event");

      // Reset form and close dialog
      setFormData({
        name: "",
        startTime: "",
        endTime: "",
        location: "",
        capacity: "",
        visibility: "public",
      });
      setOpen(false);
      onEventCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new event for the calendar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <FormErrorAlert error={error} />
            <EventNameField value={formData.name} onChange={handleInputChange} />

            <VisibilitySelectField
              id="visibility"
              value={formData.visibility}
              onValueChange={(value) => handleSelectChange("visibility", value)}
            />

            <EventSchedulingFields values={formData} onChange={handleInputChange} />
          </div>

          <SubmitCancelFooter
            isSubmitting={isLoading}
            onCancel={() => setOpen(false)}
            submitLabel="Create Event"
            submittingLabel="Creating..."
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
