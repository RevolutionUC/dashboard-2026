import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type AdminSession = NonNullable<Awaited<ReturnType<typeof getAdminSession>>>;

export async function getAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "admin") {
    return null;
  }

  return session;
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }
  return { session } as const;
}

export async function withAdminSession<T>(
  handler: (session: AdminSession) => Promise<T>,
): Promise<T | Response> {
  const auth = await requireAdminSession();
  if ("error" in auth) {
    return auth.error;
  }
  return handler(auth.session);
}
