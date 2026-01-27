import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dayOfSchedule, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";

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
    return NextResponse.json(
      { error: "Failed to fetch day-of schedule" },
      { status: 500 },
    );
  }
}

// POST create a new day-of schedule event
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    return NextResponse.json(newScheduleItem, { status: 201 });
  } catch (error) {
    console.error("Error creating day-of schedule item:", error);
    return NextResponse.json(
      { error: "Failed to create day-of schedule item" },
      { status: 500 },
    );
  }
}

// DELETE a day-of schedule event
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 },
      );
    }

    const [deletedItem] = await db
      .delete(dayOfSchedule)
      .where(eq(dayOfSchedule.id, id))
      .returning();

    if (!deletedItem) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting day-of schedule item:", error);
    return NextResponse.json(
      { error: "Failed to delete day-of schedule item" },
      { status: 500 },
    );
  }
}
