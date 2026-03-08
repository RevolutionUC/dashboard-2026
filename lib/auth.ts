import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { db } from "./db";
import * as schema from "./db/schema";
import { accessRequests } from "./db/schema";
import { sendAccessRequestEmail } from "./email";

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

// Admin emails that automatically get admin role
const ADMIN_EMAILS = [
  "bilwarad@mail.uc.edu",
  "karthikeya.rachamolla@gmail.com",
];

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
  plugins: [
    admin({
      defaultRole: "user",
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());

          if (isAdmin) {
            // Auto-approve admins: set role to admin and create an approved access request
            await db
              .update(schema.user)
              .set({ role: "admin" })
              .where(eq(schema.user.id, user.id));

            await db.insert(accessRequests).values({
              userId: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              status: "approved",
              reviewedAt: new Date(),
            });
          } else {
            // Create a pending access request
            await db.insert(accessRequests).values({
              userId: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              status: "pending",
            });

            // Notify admin emails about the new access request
            for (const adminEmail of ADMIN_EMAILS) {
              sendAccessRequestEmail(adminEmail, user.name, user.email).catch(
                (err: unknown) =>
                  console.error(
                    `Failed to send access request email to ${adminEmail}:`,
                    err,
                  ),
              );
            }
          }
        },
      },
    },
  },
});
