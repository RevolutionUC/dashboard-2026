import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dayOfSchedule, user } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { logNamedTargetAction, requireNonOrganizerSession, requireSessionWithId } from "@/lib/api/route-utils";

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
    const auth = await requireNonOrganizerSession();
    if ("error" in auth) {
      return auth.error;
    }
    const { session } = auth;

    const body = await request.json();

    const { name, startTime, endTime, location, capacity, visibility } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Validate visibility
    if (visibility && !["internal", "public"].includes(visibility)) {
      return NextResponse.json(
        { error: "Visibility must be 'internal' or 'public'" },
        { status: 400 },
      );
    }

    const [newScheduleItem] = await db
      .insert(dayOfSchedule)
      .values({
        name,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        location: location || null,
        capacity: capacity ? Number.parseInt(capacity, 10) : null,
        visibility: visibility || "public",
        createdBy: session.user.id,
      })
      .returning();
    
    await logNamedTargetAction(session, "CREATE_SCHEDULE", newScheduleItem.id, newScheduleItem.name);

    return NextResponse.json(newScheduleItem, { status: 201 });
  } catch (error) {
    console.error("Error creating day-of schedule item:", error);
    return NextResponse.json({ error: "Failed to create day-of schedule item" }, { status: 500 });
  }
}

// PATCH update a day-of schedule event
export async function PATCH(request: NextRequest) {
  try {
    const sessionAndId = await requireSessionWithId(request);
    if ("error" in sessionAndId) {
      return sessionAndId.error;
    }
    const { session, id } = sessionAndId;

    const body = await request.json();
    const { name, startTime, endTime, location, capacity, visibility } = body;

    if (visibility && !["internal", "public"].includes(visibility)) {
      return NextResponse.json(
        { error: "Visibility must be 'internal' or 'public'" },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (startTime !== undefined) updateData.startTime = startTime ? new Date(startTime) : null;
    if (endTime !== undefined) updateData.endTime = endTime ? new Date(endTime) : null;
    if (location !== undefined) updateData.location = location || null;
    if (capacity !== undefined) updateData.capacity = capacity ? Number.parseInt(capacity, 10) : null;
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
  } catch (error) {
    console.error("Error updating schedule item:", error);
    return NextResponse.json({ error: "Failed to update schedule item" }, { status: 500 });
  }
}

// DELETE a day-of schedule event
export async function DELETE(request: NextRequest) {
  try {
    const sessionAndId = await requireSessionWithId(request);
    if ("error" in sessionAndId) {
      return sessionAndId.error;
    }
    const { session, id } = sessionAndId;

    const [deletedItem] = await db
      .delete(dayOfSchedule)
      .where(eq(dayOfSchedule.id, id))
      .returning();

    if (!deletedItem) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    await logNamedTargetAction(session, "DELETE_SCHEDULE", deletedItem.id, deletedItem.name);

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting day-of schedule item:", error);
    return NextResponse.json({ error: "Failed to delete day-of schedule item" }, { status: 500 });
  }
}
