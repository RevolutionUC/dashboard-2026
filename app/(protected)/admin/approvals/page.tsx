"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AccessRequest {
  id: string;
  userId: string;
  email: string;
  name: string;
  image: string | null;
  status: "pending" | "approved" | "denied";
  requestedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

export default function AdminApprovalsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);

  const fetchRequests = async (status?: string) => {
    try {
      const params = status && status !== "all" ? `?status=${status}` : "";
      const response = await fetch(`/api/admin/approvals${params}`);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - admin access required");
        }
        throw new Error("Failed to fetch requests");
      }
      const data = await response.json();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchRequests(statusFilter);
  }, [statusFilter]);

  const handleAction = async (
    requestId: string,
    action: "approve" | "deny" | "revoke",
  ) => {
    setActionInFlight(requestId);
    try {
      const response = await fetch("/api/admin/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      if (!response.ok) {
        throw new Error(`Failed to ${action} request`);
      }
      // Refresh the list
      await fetchRequests(statusFilter);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to ${action} request`,
      );
    } finally {
      setActionInFlight(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <main className="p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Access Approvals</h1>
          <p className="text-sm text-muted-foreground">
            Manage user access requests to the dashboard
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-35">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-3 w-48 rounded bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {statusFilter === "pending"
                ? "No pending requests"
                : statusFilter === "all"
                  ? "No access requests yet"
                  : `No ${statusFilter} requests`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {statusFilter === "all" && pendingCount > 0 && (
            <p className="text-sm font-medium text-muted-foreground">
              {pendingCount} pending{" "}
              {pendingCount === 1 ? "request" : "requests"}
            </p>
          )}
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  {request.image ? (
                    <Image
                      src={request.image}
                      alt={request.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {request.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {request.name}
                      </p>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {request.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requested {formatDate(request.requestedAt)}
                      {request.reviewedAt &&
                        ` \u00b7 Reviewed ${formatDate(request.reviewedAt)}`}
                    </p>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleAction(request.id, "approve")}
                        disabled={actionInFlight === request.id}
                      >
                        {actionInFlight === request.id ? "..." : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(request.id, "deny")}
                        disabled={actionInFlight === request.id}
                      >
                        {actionInFlight === request.id ? "..." : "Deny"}
                      </Button>
                    </div>
                  )}

                  {request.status === "approved" && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(request.id, "revoke")}
                        disabled={actionInFlight === request.id}
                      >
                        {actionInFlight === request.id ? "..." : "Revoke"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    approved:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    denied: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}
