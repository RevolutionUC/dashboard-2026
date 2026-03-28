import { db } from "@/lib/db";
import { participants, events, eventRegistrations } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    
    const workshopEvents = await db
      .select({
        id: events.id,
        name: events.name,
        eventType: events.eventType,
      })
      .from(events)
      .where(eq(events.eventType, 'WORKSHOP'));
    
    const foodEvents = await db
      .select({
        id: events.id,
        name: events.name,
        eventType: events.eventType,
      })
      .from(events)
      .where(eq(events.eventType, 'FOOD'));
    
    const workshopEventIds = workshopEvents.map((e) => e.id);
    const foodEventIds = foodEvents.map((e) => e.id);
    
    const workshopRegistrations =
      workshopEventIds.length === 0
        ? []
        : await db
            .select({
              id: eventRegistrations.id,
              participant_id: eventRegistrations.participant_id,
              event_id: eventRegistrations.eventId,
              registered_at: eventRegistrations.registeredAt
            })
            .from(eventRegistrations)
            .where(inArray(eventRegistrations.eventId, workshopEventIds))
    
    const foodRegistrations =
      foodEventIds.length === 0
        ? []
        : await db
            .select({
              id: eventRegistrations.id,
              participant_id: eventRegistrations.participant_id,
              event_id: eventRegistrations.eventId,
              registered_at: eventRegistrations.registeredAt
            })
            .from(eventRegistrations)
            .where(inArray(eventRegistrations.eventId, foodEventIds))
    
    const participantIds = Array.from(
      new Set(
        [...workshopRegistrations, ...foodRegistrations]
          .map((r) => r.participant_id)
          .filter(Boolean)
      )
    );
    
    const participantRows = 
      participantIds.length === 0
        ? []
        : await db
          .select({
            id: participants.user_id,
            first_name: participants.firstName,
            last_name: participants.lastName,
            email: participants.email,
          })
          .from(participants)
          .where(inArray(participants.user_id, participantIds))
    
    const participantMap = Object.fromEntries(
      participantRows.map((p) => [p.id, p])
    );
    
    return NextResponse.json({
      workshops: workshopEvents,
      food: foodEvents,
      workshopRegistrations,
      foodRegistrations,
      participants: participantMap,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("GET /api/event-stats failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch event stats" },
      { status: 500 }
    );
  }
}