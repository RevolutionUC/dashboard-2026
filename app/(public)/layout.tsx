import type { Metadata } from "next";
import "../globals.css"

export const metadata: Metadata = {
  title: "Judging Portal - RevolutionUC",
};

export default function JudgingPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background">{children}</main>
  );
}
