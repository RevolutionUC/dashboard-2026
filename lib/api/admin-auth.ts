import { headers } from "next/headers";
import { auth } from "@/lib/auth";

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
