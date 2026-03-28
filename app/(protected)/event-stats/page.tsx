"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL = 5000; // 5 seconds

interface CheckinAttendee {
  id: string;
  name: string;
  email?: string;
}

interface GroupStat {
  id: string;
  name: string;
  checkedIn: number;
  totalRegistered?: number;
  attendees: CheckinAttendee[];
}

interface EventStatsResponse {
  workshops: GroupStat[];
  food: GroupStat[];
}

/** Raw API payload from /api/event-stats */
interface RawEvent {
  id: string;
  name: string;
  eventType: "WORKSHOP" | "FOOD" | string;
}

interface RawRegistration {
  id: string;
  event_id?: string;
  participant_id?: string;
  eventId?: string;
  participantId?: string;
  checkedInAt?: string | null;
  registered_at?: string | null;
}

interface RawParticipant {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string | null;
}

interface RawEventStatsResponse {
  workshops: RawEvent[];
  food: RawEvent[];
  workshopRegistrations: RawRegistration[];
  foodRegistrations: RawRegistration[];
  participants: Record<string, RawParticipant>;
  lastUpdated?: string;
}

function normalizeRegistration(reg: RawRegistration) {
  return {
    id: reg.id,
    eventId: reg.eventId ?? reg.event_id ?? "",
    participantId: reg.participantId ?? reg.participant_id ?? "",
  };
}

function participantDisplayName(p?: RawParticipant) {
  if (!p) return "Unknown participant";
  if (p.name && p.name.trim().length > 0) return p.name;
  const full = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
  return full.length > 0 ? full : "Unknown participant";
}

function toGroupStats(
  eventsList: RawEvent[],
  registrations: RawRegistration[],
  participantsMap: Record<string, RawParticipant>
): GroupStat[] {
  // Normalize registrations once for all events
  const normalizedRegs = registrations.map(normalizeRegistration);

  return eventsList.map((event) => {
    const eventRegs = normalizedRegs.filter((r) => r.eventId === event.id);

    const attendees: CheckinAttendee[] = eventRegs.map((reg) => {
      const p = participantsMap[reg.participantId];
      return {
        id: reg.participantId,
        name: participantDisplayName(p),
        email: p?.email ?? undefined,
      };
    });

    return {
      id: event.id,
      name: event.name,
      checkedIn: attendees.length,
      totalRegistered: attendees.length,
      attendees,
    };
  });
}

function shapeEventStatsPayload(raw: RawEventStatsResponse): EventStatsResponse {
  return {
    workshops: toGroupStats(raw.workshops, raw.workshopRegistrations, raw.participants),
    food: toGroupStats(raw.food, raw.foodRegistrations, raw.participants),
  };
}

export default function EventStatsPage() {
  const [data, setData] = useState<EventStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);

  const fetchStats = async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;

    try {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);

      const response = await fetch("/api/event-stats");
      if (!response.ok) throw new Error("Failed to fetch event stats");

      const raw = (await response.json()) as RawEventStatsResponse;
      const shaped = shapeEventStatsPayload(raw);

      setData(shaped);
      setError(null);

      // Keep selected item if it still exists, otherwise default to first
      if (shaped.workshops.length > 0) {
        setSelectedWorkshopId((prev) =>
          prev && shaped.workshops.some((w) => w.id === prev) ? prev : shaped.workshops[0].id
        );
      } else {
        setSelectedWorkshopId(null);
      }

      if (shaped.food.length > 0) {
        setSelectedFoodId((prev) =>
          prev && shaped.food.some((f) => f.id === prev) ? prev : shaped.food[0].id
        );
      } else {
        setSelectedFoodId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load event stats");
      console.error("Error fetching event stats:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats({ silent: false });

    const interval = setInterval(() => {
      fetchStats({ silent: true });
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const selectedWorkshop = useMemo(
    () => data?.workshops.find((w) => w.id === selectedWorkshopId) ?? null,
    [data?.workshops, selectedWorkshopId]
  );

  const selectedFood = useMemo(
    () => data?.food.find((f) => f.id === selectedFoodId) ?? null,
    [data?.food, selectedFoodId]
  );

  const filteredWorkshopAttendees = useMemo(() => {
    const attendees = selectedWorkshop?.attendees ?? [];
    return attendees.filter((a) => `${a.name} ${a.email ?? ""}`.toLowerCase());
  }, [selectedWorkshop]);

  const filteredFoodAttendees = useMemo(() => {
    const attendees = selectedFood?.attendees ?? [];
    return attendees.filter((a) => `${a.name} ${a.email ?? ""}`.toLowerCase());
  }, [selectedFood]);

  return (
    <main className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Event Stats</h1>
          <p className="text-sm text-muted-foreground">
            Check-ins for workshops and food
            {isLoading && " (loading...)"}{" "}
            {isRefreshing && !isLoading && " (updating...)"}{" "}
            {error && ` (error: ${error})`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchStats({ silent: false })}>
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="workshops" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="workshops">Workshops</TabsTrigger>
          <TabsTrigger value="food">Food</TabsTrigger>
        </TabsList>

        <TabsContent value="workshops" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
            <Card>
              <CardHeader>
                <CardTitle>Workshops</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(data?.workshops ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No workshop data yet.</p>
                )}

                {(data?.workshops ?? []).map((workshop) => {
                  const selected = workshop.id === selectedWorkshopId;
                  const total = workshop.totalRegistered ?? 0;
                  return (
                    <button
                      key={workshop.id}
                      type="button"
                      onClick={() => setSelectedWorkshopId(workshop.id)}
                      className={`w-full rounded-md border p-3 text-left transition ${
                        selected ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{workshop.name}</p>
                        <Badge variant="secondary">{workshop.checkedIn}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {`${workshop.checkedIn} checked in`}
                      </p>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedWorkshop
                    ? `${selectedWorkshop.name} — ${selectedWorkshop.checkedIn} checked in`
                    : "Workshop attendees"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedWorkshop ? (
                  <p className="text-sm text-muted-foreground">Select a workshop to view who checked in.</p>
                ) : (
                  <>
                    <div className="max-h-[420px] overflow-auto rounded-md border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr className="text-left">
                            <th className="px-3 py-2 font-medium">Name</th>
                            <th className="px-3 py-2 font-medium">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredWorkshopAttendees.length === 0 ? (
                            <tr>
                              <td className="px-3 py-3 text-muted-foreground" colSpan={2}>
                                No attendees found.
                              </td>
                            </tr>
                          ) : (
                            filteredWorkshopAttendees.map((a) => (
                              <tr key={a.id} className="border-t">
                                <td className="px-3 py-2">{a.name}</td>
                                <td className="px-3 py-2 text-muted-foreground">{a.email || "—"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="food" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
            <Card>
              <CardHeader>
                <CardTitle>Food Checkpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(data?.food ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No food check-in data yet.</p>
                )}

                {(data?.food ?? []).map((meal) => {
                  const selected = meal.id === selectedFoodId;
                  return (
                    <button
                      key={meal.id}
                      type="button"
                      onClick={() => setSelectedFoodId(meal.id)}
                      className={`w-full rounded-md border p-3 text-left transition ${
                        selected ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{meal.name}</p>
                        <Badge variant="secondary">{meal.checkedIn}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{meal.checkedIn} checked in</p>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedFood
                    ? `${selectedFood.name} — ${selectedFood.checkedIn} checked in`
                    : "Food check-ins"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedFood ? (
                  <p className="text-sm text-muted-foreground">
                    Select a food checkpoint to view who checked in.
                  </p>
                ) : (
                  <>
                    <div className="max-h-[420px] overflow-auto rounded-md border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr className="text-left">
                            <th className="px-3 py-2 font-medium">Name</th>
                            <th className="px-3 py-2 font-medium">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFoodAttendees.length === 0 ? (
                            <tr>
                              <td className="px-3 py-3 text-muted-foreground" colSpan={2}>
                                No attendees found.
                              </td>
                            </tr>
                          ) : (
                            filteredFoodAttendees.map((a) => (
                              <tr key={a.id} className="border-t">
                                <td className="px-3 py-2">{a.name}</td>
                                <td className="px-3 py-2 text-muted-foreground">{a.email || "—"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
