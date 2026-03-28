import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSessionWithRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { logAction } from "@/lib/audit";

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
    // Check authentication
    const sessionInfo = await getSessionWithRole();

    if (!sessionInfo) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { session, dashboardRole } = sessionInfo;

    // Block organizers from creating events
    if (dashboardRole === "organizer") {
      return NextResponse.json({ error: "Forbidden - insufficient permissions" }, { status: 403 });
    }

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
    
    await logAction({
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email,
      action: "CREATE_EVENT",
      targetId: newEvent.id,
      details: { name: newEvent.name },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

// PATCH update an event
export async function PATCH(request: NextRequest) {
  try {
    const sessionInfo = await getSessionWithRole();

    if (!sessionInfo) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { session, dashboardRole } = sessionInfo;

    // Block organizers from updating events
    if (dashboardRole === "organizer") {
      return NextResponse.json({ error: "Forbidden - insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

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

    await logAction({
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email,
      action: "UPDATE_EVENT",
      targetId: updatedEvent.id,
      details: { name: updatedEvent.name },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE an event
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const sessionInfo = await getSessionWithRole();

    if (!sessionInfo) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { session, dashboardRole } = sessionInfo;

    // Block organizers from deleting events
    if (dashboardRole === "organizer") {
      return NextResponse.json({ error: "Forbidden - insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const [deletedEvent] = await db.delete(events).where(eq(events.id, id)).returning();

    if (!deletedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    await logAction({
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email,
      action: "DELETE_EVENT",
      targetId: deletedEvent.id,
      details: { name: deletedEvent.name },
    });
    
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
