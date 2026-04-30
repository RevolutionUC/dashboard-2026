import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { logNamedTargetAction, requireNonOrganizerSession, requireSessionWithId } from "@/lib/api/route-utils";

// GET all events
export async function GET() {
  try {
    const allEvents = await db.select().from(events).orderBy(desc(events.startTime));

    return NextResponse.json(allEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST create a new event
export async function POST(request: NextRequest) {
  try {
    const auth = await requireNonOrganizerSession();
    if ("error" in auth) {
      return auth.error;
    }
    const { session } = auth;

    const body = await request.json();
    const { name, description, eventType, startTime, endTime, location, capacity } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!eventType) {
      return NextResponse.json({ error: "Event type is required" }, { status: 400 });
    }

    // Validate event type
    if (!["WORKSHOP", "FOOD"].includes(eventType)) {
      return NextResponse.json(
        { error: "Event type must be 'WORKSHOP' or 'FOOD'" },
        { status: 400 },
      );
    }

    const [newEvent] = await db
      .insert(events)
      .values({
        name,
        description: description || null,
        eventType,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        location: location || null,
        capacity: capacity ? Number.parseInt(capacity, 10) : null,
      })
      .returning();
    
    await logNamedTargetAction(session, "CREATE_EVENT", newEvent.id, newEvent.name);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

// PATCH update an event
export async function PATCH(request: NextRequest) {
  try {
    const sessionAndId = await requireSessionWithId(request);
    if ("error" in sessionAndId) {
      return sessionAndId.error;
    }
    const { session, id } = sessionAndId;

    const body = await request.json();
    const { name, description, eventType, startTime, endTime, location, capacity } = body;

    if (eventType && !["WORKSHOP", "FOOD"].includes(eventType)) {
      return NextResponse.json(
        { error: "Event type must be 'WORKSHOP' or 'FOOD'" },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (eventType !== undefined) updateData.eventType = eventType;
    if (startTime !== undefined) updateData.startTime = startTime ? new Date(startTime) : null;
    if (endTime !== undefined) updateData.endTime = endTime ? new Date(endTime) : null;
    if (location !== undefined) updateData.location = location || null;
    if (capacity !== undefined) updateData.capacity = capacity ? Number.parseInt(capacity, 10) : null;
    updateData.updatedAt = new Date();

    const [updatedEvent] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await logNamedTargetAction(session, "UPDATE_EVENT", updatedEvent.id, updatedEvent.name);

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE an event
export async function DELETE(request: NextRequest) {
  try {
    const sessionAndId = await requireSessionWithId(request);
    if ("error" in sessionAndId) {
      return sessionAndId.error;
    }
    const { session, id } = sessionAndId;

    const [deletedEvent] = await db.delete(events).where(eq(events.id, id)).returning();

    if (!deletedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    await logNamedTargetAction(session, "DELETE_EVENT", deletedEvent.id, deletedEvent.name);
    
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
