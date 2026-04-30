import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { withAdminSession } from "@/lib/api/admin-auth";

// GET /api/admin/logs - Fetch audit logs with optional filters
export async function GET(request: Request) {
  return withAdminSession(async () => {
    const { searchParams } = new URL(request.url);
    const actionFilter = searchParams.get("action");
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 200);
    const offset = Math.max(Number(searchParams.get("offset") || "0"), 0);

    try {
      let query = db
        .select({
          id: auditLogs.id,
          session_id: auditLogs.session_id,
          user_id: auditLogs.user_id,
          name: auditLogs.name,
          email: auditLogs.email,
          action: auditLogs.action,
          target_id: auditLogs.target_id,
          details: auditLogs.details,
          event_time: auditLogs.event_time,
        })
        .from(auditLogs)
        .orderBy(desc(auditLogs.event_time))
        .limit(limit)
        .offset(offset)
        .$dynamic();

      if (actionFilter && actionFilter !== "all") {
        query = query.where(
          eq(
            auditLogs.action,
            actionFilter as typeof auditLogs.action.enumValues[number],
          ),
        );
      }

      const logs = await query;
      return NextResponse.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return NextResponse.json(
        { error: "Failed to fetch audit logs" },
        { status: 500 },
      );
    }
  });
}
