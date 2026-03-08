"use client";

import Image from "next/image";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

interface PendingApprovalClientProps {
  userName: string;
  userEmail: string;
  userImage: string | null | undefined;
  status: string;
  userId: string;
}

export function PendingApprovalClient({
  userName,
  userEmail,
  userImage,
  status,
  userId,
}: PendingApprovalClientProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleRequestAgain = async () => {
    setIsRequesting(true);
    try {
      const response = await fetch("/api/admin/approvals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        setRequestSent(true);
      }
    } catch (error) {
      console.error("Failed to submit request:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const isDenied = status === "denied";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 text-center">
        {userImage && (
          <div className="flex justify-center">
            <Image
              src={userImage}
              alt={userName}
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
        )}

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {isDenied ? "Access Denied" : "Pending Approval"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium">{userName}</span> (
            {userEmail})
          </p>
        </div>

        {isDenied && !requestSent ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Your access request was denied. You can submit a new request if
              you believe this was a mistake.
            </p>
            <button
              type="button"
              onClick={handleRequestAgain}
              disabled={isRequesting}
              className="w-full bg-primary text-primary-foreground rounded-lg font-medium text-sm h-10 px-4 cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRequesting ? "Submitting..." : "Request Access Again"}
            </button>
          </div>
        ) : requestSent ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                Your request has been resubmitted. An admin will review it
                shortly.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Your access request is pending admin approval. You&apos;ll
                receive an email when your request has been reviewed.
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.href = "/sign-in";
                },
              },
            })
          }
          className="w-full bg-secondary text-secondary-foreground rounded-lg font-medium text-sm h-10 px-4 cursor-pointer hover:bg-secondary/80 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
