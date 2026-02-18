import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { headers } from "next/headers";
import { db } from "./db";
import * as schema from "./db/schema";

if (
  !process.env.BETTER_AUTH_SECRET ||
  !process.env.BETTER_AUTH_URL ||
  !process.env.GITHUB_CLIENT_ID ||
  !process.env.GITHUB_CLIENT_SECRET
) {
  throw new Error(
    "BETTER AUTH SECRET, URL OR GITHUB CLIENT ID OR SECRET MISSING ",
  );
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});

/**
 * Assert that the current request is authenticated.
 * Throws an error if the user is not logged in.
 */
export async function assertAuthorization(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }
}
