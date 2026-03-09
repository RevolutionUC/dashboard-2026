import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

// Action types
type AuditAction =
  | "SIGNED_IN"
  | "CHECKIN"
  | "WORKSHOP_CHECKIN"
  | "FOOD_CHECKIN"
  | "UPDATE_STATUS"
  | "CREATE_EVENT"
  | "DELETE_EVENT"
  | "CREATE_SCHEDULE"
  | "DELETE_SCHEDULE"
  | "APPROVE_USER"
  | "DENY_USER";

interface LogActionParams {
  userId: string;
  name: string;
  email: string;
  action: AuditAction;
  sessionId?: string | null;
  targetId?: string | null;
  details?: Record<string, unknown> | null;
}


export async function logAction({
  userId,
  name,
  email,
  action,
  sessionId = null,
  targetId = null,
  details = null,
}: LogActionParams): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      user_id: userId,
      name,
      email,
      action,
      session_id: sessionId,
      target_id: targetId,
      details,
    });
  } catch (err) {
    console.error("Audit log failed (non-fatal):", err);
  }
}
