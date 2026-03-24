-- Add dashboard_role column to user table
ALTER TABLE "user" ADD COLUMN "dashboard_role" text DEFAULT 'lead';

-- Add role column to access_requests table
ALTER TABLE "access_requests" ADD COLUMN "role" text DEFAULT 'lead';

-- Set admin dashboard_role for admin emails
UPDATE "user" SET "dashboard_role" = 'admin' WHERE "role" = 'admin';
