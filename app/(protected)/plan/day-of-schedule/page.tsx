"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Users, Eye, EyeOff, Trash2, Pencil } from "lucide-react";
import { CreateEventDialog } from "@/components/create-event-dialog";
import { EventDetailsDialog } from "@/components/event-details-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";

interface DbEvent {
  id: string;
  name: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  capacity: number | null;
  visibility: "internal" | "public";
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  creatorEmail: string | null;
  creatorName: string | null;
}

interface ScheduleItem {
  id: string;
  title: string;
  start: Date;
  end: Date;
  visibility: "internal" | "public";
  location?: string;
  capacity?: number;
  creatorEmail?: string;
  creatorName?: string;
  createdAt: string;
  updatedAt: string;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateHeader(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default function DayOfSchedule() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    startTime: "",
    endTime: "",
    location: "",
    capacity: "",
    visibility: "public",
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { data: session } = authClient.useSession();

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch("/api/day-of-schedule");
      if (response.ok) {
        const data: DbEvent[] = await response.json();
        const scheduleItems: ScheduleItem[] = data
          .filter((event) => event.startTime && event.endTime)
          .map((event) => ({
            id: event.id,
            title: event.name,
            start: new Date(event.startTime!),
            end: new Date(event.endTime!),
            visibility: event.visibility,
            location: event.location || undefined,
            capacity: event.capacity || undefined,
            creatorEmail: event.creatorEmail || undefined,
            creatorName: event.creatorName || undefined,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
          }))
          .sort((a, b) => a.start.getTime() - b.start.getTime());
        setItems(scheduleItems);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/day-of-schedule?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDeleteTarget(null);
        fetchItems();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setEditError(null);
    const toLocalDatetime = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setEditForm({
      name: item.title,
      startTime: toLocalDatetime(item.start),
      endTime: toLocalDatetime(item.end),
      location: item.location || "",
      capacity: item.capacity?.toString() || "",
      visibility: item.visibility,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSelectChange = (name: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    setEditError(null);

    try {
      const response = await fetch(`/api/day-of-schedule?id=${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update item");
      }

      setEditingItem(null);
      fetchItems();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Group items by date
  const grouped = new Map<string, ScheduleItem[]>();
  for (const item of items) {
    const key = getDateKey(item.start);
    const group = grouped.get(key);
    if (group) {
      group.push(item);
    } else {
      grouped.set(key, [item]);
    }
  }

  return (
    <div className="flex flex-col h-screen pt-14">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Day of Schedule</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              <span>Public</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span>Internal</span>
            </div>
          </div>
        </div>

        {session && <CreateEventDialog onEventCreated={fetchItems} />}
      </div>

      {/* Schedule list */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading schedule...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No schedule items yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-8">
            {Array.from(grouped.entries()).map(([dateKey, groupItems]) => (
              <div key={dateKey}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {formatDateHeader(groupItems[0].start)}
                </h2>
                <div className="space-y-2">
                  {groupItems.map((item) => {
                    const isInternal = item.visibility === "internal";
                    return (
                      <div
                        key={item.id}
                        className="w-full text-left flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        {/* Time */}
                        <button
                          onClick={() => {
                            setSelectedEvent(item);
                            setDetailsOpen(true);
                          }}
                          className="shrink-0 text-right w-28 pt-0.5 text-left"
                        >
                          <div className="text-sm font-medium">{formatTime(item.start)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(item.end)}
                          </div>
                        </button>

                        {/* Color bar */}
                        <button
                          onClick={() => {
                            setSelectedEvent(item);
                            setDetailsOpen(true);
                          }}
                          className={`shrink-0 w-0.5 self-stretch rounded-full ${
                            isInternal ? "bg-red-500" : "bg-blue-500"
                          }`}
                        />

                        {/* Content */}
                        <button
                          onClick={() => {
                            setSelectedEvent(item);
                            setDetailsOpen(true);
                          }}
                          className="flex-1 min-w-0 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{item.title}</span>
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                                isInternal
                                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              }`}
                            >
                              {isInternal ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                              {item.visibility}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            {item.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {item.location}
                              </span>
                            )}
                            {item.capacity && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {item.capacity}
                              </span>
                            )}
                          </div>
                        </button>

                        {/* Action buttons */}
                        {session && (
                          <div className="flex items-center gap-1 shrink-0 mt-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(item);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(item);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Details Dialog */}
      <EventDetailsDialog
        event={selectedEvent}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEventDeleted={fetchItems}
        canDelete={!!session}
      />

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Schedule Item</DialogTitle>
            <DialogDescription>
              Update the schedule item details below.
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
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  placeholder="Enter name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-visibility">Visibility *</Label>
                <Select
                  value={editForm.visibility}
                  onValueChange={(value) => handleEditSelectChange("visibility", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Public
                      </span>
                    </SelectItem>
                    <SelectItem value="internal">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Internal
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                onClick={() => setEditingItem(null)}
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
            <DialogTitle>Delete Schedule Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This cannot be undone.
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
