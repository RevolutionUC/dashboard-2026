"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Plus, Trash2, Pencil, UtensilsCrossed, Presentation, MapPin, Users, Clock } from "lucide-react";

function toISOStringWithTimezone(datetimeLocal: string): string {
  const date = new Date(datetimeLocal);
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const offsetHours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, "0");
  const offsetMinutes = (Math.abs(offset) % 60).toString().padStart(2, "0");
  return `${datetimeLocal}:00${sign}${offsetHours}:${offsetMinutes}`;
}

interface Event {
  id: string;
  name: string;
  description: string | null;
  eventType: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  capacity: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { data: session } = authClient.useSession();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventType: "WORKSHOP",
    startTime: "",
    endTime: "",
    location: "",
    capacity: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    eventType: "WORKSHOP",
    startTime: "",
    endTime: "",
    location: "",
    capacity: "",
  });

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data: Event[] = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        startTime: formData.startTime ? toISOStringWithTimezone(formData.startTime) : "",
        endTime: formData.endTime ? toISOStringWithTimezone(formData.endTime) : "",
      };
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create event");
      }

      setFormData({
        name: "",
        description: "",
        eventType: "WORKSHOP",
        startTime: "",
        endTime: "",
        location: "",
        capacity: "",
      });
      setDialogOpen(false);
      fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/events?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDeleteTarget(null);
        fetchEvents();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEdit = (event: Event) => {
    setEditingEvent(event);
    setEditError(null);
    setEditForm({
      name: event.name,
      description: event.description || "",
      eventType: event.eventType,
      startTime: event.startTime ? event.startTime.slice(0, 16) : "",
      endTime: event.endTime ? event.endTime.slice(0, 16) : "",
      location: event.location || "",
      capacity: event.capacity?.toString() || "",
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSelectChange = (name: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setIsSaving(true);
    setEditError(null);

    try {
      const payload = {
        ...editForm,
        startTime: editForm.startTime ? toISOStringWithTimezone(editForm.startTime) : "",
        endTime: editForm.endTime ? toISOStringWithTimezone(editForm.endTime) : "",
      };
      const response = await fetch(`/api/events?id=${editingEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update event");
      }

      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString();
  };

  const workshopEvents = events.filter((e) => e.eventType === "WORKSHOP");
  const foodEvents = events.filter((e) => e.eventType === "FOOD");

  return (
    <div className="flex flex-col h-screen pt-14">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Events</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Presentation className="h-3.5 w-3.5 text-violet-500" />
              <span>Workshop ({workshopEvents.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UtensilsCrossed className="h-3.5 w-3.5 text-orange-500" />
              <span>Food ({foodEvents.length})</span>
            </div>
          </div>
        </div>

        {session && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new event.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="name">Event Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter event name"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter event description"
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="eventType">Event Type *</Label>
                    <Select
                      value={formData.eventType}
                      onValueChange={(value) => handleSelectChange("eventType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WORKSHOP">
                          <span className="flex items-center gap-2">
                            <Presentation className="h-3.5 w-3.5 text-violet-500" />
                            Workshop
                          </span>
                        </SelectItem>
                        <SelectItem value="FOOD">
                          <span className="flex items-center gap-2">
                            <UtensilsCrossed className="h-3.5 w-3.5 text-orange-500" />
                            Food
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className={`grid gap-4 ${formData.eventType === "WORKSHOP" ? "grid-cols-2" : ""}`}>
                    <div className="grid gap-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={handleInputChange}
                      />
                    </div>

                    {formData.eventType === "WORKSHOP" && (
                      <div className="grid gap-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          name="endTime"
                          type="datetime-local"
                          value={formData.endTime}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Enter location"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        min="1"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        placeholder="Max attendees"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Event"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No events yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {event.eventType === "WORKSHOP" ? (
                        <Presentation className="h-4 w-4 text-violet-500 shrink-0" />
                      ) : (
                        <UtensilsCrossed className="h-4 w-4 text-orange-500 shrink-0" />
                      )}
                      <CardTitle className="text-base leading-tight">{event.name}</CardTitle>
                    </div>
                    {session && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(event)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(event)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      event.eventType === "WORKSHOP"
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                        : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                    }`}
                  >
                    {event.eventType}
                  </span>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  {event.description && (
                    <p className="text-muted-foreground">{event.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {formatDateTime(event.startTime)}
                      {event.endTime && ` - ${formatDateTime(event.endTime)}`}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.capacity && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>Capacity: {event.capacity}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the event details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              {editError && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {editError}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="edit-name">Event Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-eventType">Event Type *</Label>
                <Select
                  value={editForm.eventType}
                  onValueChange={(value) => handleEditSelectChange("eventType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WORKSHOP">
                      <span className="flex items-center gap-2">
                        <Presentation className="h-3.5 w-3.5 text-violet-500" />
                        Workshop
                      </span>
                    </SelectItem>
                    <SelectItem value="FOOD">
                      <span className="flex items-center gap-2">
                        <UtensilsCrossed className="h-3.5 w-3.5 text-orange-500" />
                        Food
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={`grid gap-4 ${editForm.eventType === "WORKSHOP" ? "grid-cols-2" : ""}`}>
                <div className="grid gap-2">
                  <Label htmlFor="edit-startTime">Start Time</Label>
                  <Input
                    id="edit-startTime"
                    name="startTime"
                    type="datetime-local"
                    value={editForm.startTime}
                    onChange={handleEditChange}
                  />
                </div>

                {editForm.eventType === "WORKSHOP" && (
                  <div className="grid gap-2">
                    <Label htmlFor="edit-endTime">End Time</Label>
                    <Input
                      id="edit-endTime"
                      name="endTime"
                      type="datetime-local"
                      value={editForm.endTime}
                      onChange={handleEditChange}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    placeholder="Enter location"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input
                    id="edit-capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    value={editForm.capacity}
                    onChange={handleEditChange}
                    placeholder="Max attendees"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingEvent(null)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
