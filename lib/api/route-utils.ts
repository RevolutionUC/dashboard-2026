import { NextRequest, NextResponse } from "next/server";
import { getSessionWithRole } from "@/lib/auth";

interface AuthorizedSession {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

type AuthResult =
  | { error: NextResponse }
  | { session: AuthorizedSession };

export async function requireNonOrganizerSession(): Promise<AuthResult> {
  const sessionInfo = await getSessionWithRole();

  if (!sessionInfo) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (sessionInfo.dashboardRole === "organizer") {
    return {
      error: NextResponse.json({ error: "Forbidden - insufficient permissions" }, { status: 403 }),
    };
  }

  return {
    session: {
      user: {
        id: sessionInfo.session.user.id,
        name: sessionInfo.session.user.name,
        email: sessionInfo.session.user.email,
      },
    },
  };
}

export function getRequiredIdFromRequest(request: NextRequest): string | NextResponse {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
  }
  return id;
}
