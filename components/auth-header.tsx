"use client";

import Image from "next/image";
import { authClient } from "@/lib/auth-client";

export function AuthHeader() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-20 bg-muted animate-pulse rounded-full" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        {session.user.name || session.user.email}
      </span>
      {session.user.image && (
        <Image
          src={session.user.image}
          alt={session.user.name || "User"}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full"
        />
      )}
      <button
        type="button"
        onClick={() => authClient.signOut()}
        className="bg-secondary text-secondary-foreground rounded-full font-medium text-sm h-10 px-4 cursor-pointer hover:bg-secondary/80 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
