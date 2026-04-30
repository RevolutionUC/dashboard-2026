import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import {
  assignSchedulingUpdateFields,
  parseOptionalCapacity,
  parseOptionalDate,
  parseOptionalString,
  validateEventType,
  validateRequiredEventType,
  validateRequiredName,
  withCreateContext,
  withDeleteContext,
  withUpdateContext,
} from "@/lib/api/event-route-shared";
import { logNamedTargetAction } from "@/lib/api/route-utils";

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
    return withCreateContext(request, async ({ session, body }) => {
      const { name, description, eventType, startTime, endTime, location, capacity } = body;

      const nameError = validateRequiredName(name);
      if (nameError) return nameError;
      const requiredTypeError = validateRequiredEventType(eventType);
      if (requiredTypeError) return requiredTypeError;
      const typeError = validateEventType(eventType);
      if (typeError) return typeError;

      const [newEvent] = await db
        .insert(events)
        .values({
          name,
          description: parseOptionalString(description),
          eventType,
          startTime: parseOptionalDate(startTime),
          endTime: parseOptionalDate(endTime),
          location: parseOptionalString(location),
          capacity: parseOptionalCapacity(capacity),
        })
        .returning();

      await logNamedTargetAction(session, "CREATE_EVENT", newEvent.id, newEvent.name);

      return NextResponse.json(newEvent, { status: 201 });
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

// PATCH update an event
export async function PATCH(request: NextRequest) {
  try {
    return withUpdateContext(request, async ({ session, id, body }) => {
      const { name, description, eventType, startTime, endTime, location, capacity } = body;

      const typeError = validateEventType(eventType);
      if (typeError) return typeError;

      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = parseOptionalString(description);
      if (eventType !== undefined) updateData.eventType = eventType;
      assignSchedulingUpdateFields(updateData, { startTime, endTime, location, capacity });
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
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE an event
export async function DELETE(request: NextRequest) {
  try {
    return withDeleteContext(request, async ({ session, id }) => {
      const [deletedEvent] = await db.delete(events).where(eq(events.id, id)).returning();

      if (!deletedEvent) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      await logNamedTargetAction(session, "DELETE_EVENT", deletedEvent.id, deletedEvent.name);

      return NextResponse.json({ message: "Event deleted successfully" });
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
