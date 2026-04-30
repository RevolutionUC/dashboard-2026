import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dayOfSchedule, user } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  assignSchedulingUpdateFields,
  parseOptionalCapacity,
  parseOptionalDate,
  parseOptionalString,
  validateRequiredName,
  validateVisibility,
  withCreateContext,
  withDeleteContext,
  withUpdateContext,
} from "@/lib/api/event-route-shared";
import { logNamedTargetAction } from "@/lib/api/route-utils";

// GET all day-of schedule events with creator info
export async function GET() {
  try {
    const allScheduleItems = await db
      .select({
        id: dayOfSchedule.id,
        name: dayOfSchedule.name,
        startTime: dayOfSchedule.startTime,
        endTime: dayOfSchedule.endTime,
        location: dayOfSchedule.location,
        capacity: dayOfSchedule.capacity,
        visibility: dayOfSchedule.visibility,
        createdBy: dayOfSchedule.createdBy,
        createdAt: dayOfSchedule.createdAt,
        updatedAt: dayOfSchedule.updatedAt,
        creatorEmail: user.email,
        creatorName: user.name,
      })
      .from(dayOfSchedule)
      .leftJoin(user, eq(dayOfSchedule.createdBy, user.id))
      .orderBy(desc(dayOfSchedule.startTime));

    return NextResponse.json(allScheduleItems);
  } catch (error) {
    console.error("Error fetching day-of schedule:", error);
    return NextResponse.json({ error: "Failed to fetch day-of schedule" }, { status: 500 });
  }
}

// POST create a new day-of schedule event
export async function POST(request: NextRequest) {
  try {
    return withCreateContext(request, async ({ session, body }) => {
      const { name, startTime, endTime, location, capacity, visibility } = body;

      const nameError = validateRequiredName(name);
      if (nameError) return nameError;

      const visibilityError = validateVisibility(visibility);
      if (visibilityError) return visibilityError;

      const [newScheduleItem] = await db
        .insert(dayOfSchedule)
        .values({
          name,
          startTime: parseOptionalDate(startTime),
          endTime: parseOptionalDate(endTime),
          location: parseOptionalString(location),
          capacity: parseOptionalCapacity(capacity),
          visibility: visibility || "public",
          createdBy: session.user.id,
        })
        .returning();

      await logNamedTargetAction(session, "CREATE_SCHEDULE", newScheduleItem.id, newScheduleItem.name);

      return NextResponse.json(newScheduleItem, { status: 201 });
    });
  } catch (error) {
    console.error("Error creating day-of schedule item:", error);
    return NextResponse.json({ error: "Failed to create day-of schedule item" }, { status: 500 });
  }
}

// PATCH update a day-of schedule event
export async function PATCH(request: NextRequest) {
  try {
    return withUpdateContext(request, async ({ session, id, body }) => {
      const { name, startTime, endTime, location, capacity, visibility } = body;

      const visibilityError = validateVisibility(visibility);
      if (visibilityError) return visibilityError;

      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      assignSchedulingUpdateFields(updateData, { startTime, endTime, location, capacity });
      if (visibility !== undefined) updateData.visibility = visibility;
      updateData.updatedAt = new Date();

      const [updatedItem] = await db
        .update(dayOfSchedule)
        .set(updateData)
        .where(eq(dayOfSchedule.id, id))
        .returning();

      if (!updatedItem) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      await logNamedTargetAction(session, "UPDATE_SCHEDULE", updatedItem.id, updatedItem.name);

      return NextResponse.json(updatedItem);
    });
  } catch (error) {
    console.error("Error updating schedule item:", error);
    return NextResponse.json({ error: "Failed to update schedule item" }, { status: 500 });
  }
}

// DELETE a day-of schedule event
export async function DELETE(request: NextRequest) {
  try {
    return withDeleteContext(request, async ({ session, id }) => {
      const [deletedItem] = await db
        .delete(dayOfSchedule)
        .where(eq(dayOfSchedule.id, id))
        .returning();

      if (!deletedItem) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      await logNamedTargetAction(session, "DELETE_SCHEDULE", deletedItem.id, deletedItem.name);

      return NextResponse.json({ message: "Event deleted successfully" });
    });
  } catch (error) {
    console.error("Error deleting day-of schedule item:", error);
    return NextResponse.json({ error: "Failed to delete day-of schedule item" }, { status: 500 });
  }
}
