"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuditLog {
  id: string;
  session_id: string | null;
  user_id: string;
  name: string;
  email: string;
  action: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  event_time: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  SIGNED_IN: {
    label: "Signed In",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  CHECKIN: {
    label: "Check-in",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  WORKSHOP_CHECKIN: {
    label: "Workshop",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  FOOD_CHECKIN: {
    label: "Food",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
  UPDATE_STATUS: {
    label: "Status Change",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  CREATE_EVENT: {
    label: "Create Event",
    color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  },
  DELETE_EVENT: {
    label: "Delete Event",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  CREATE_SCHEDULE: {
    label: "Create Schedule",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  },
  DELETE_SCHEDULE: {
    label: "Delete Schedule",
    color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  },
  APPROVE_USER: {
    label: "Approve User",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  DENY_USER: {
    label: "Deny User",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

const POLL_INTERVAL = 2000;

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchLogs = useCallback(async () => {
    try {
      const params = actionFilter !== "all" ? `?action=${actionFilter}` : "";
      const response = await fetch(`/api/admin/logs${params}`);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - admin access required");
        }
        throw new Error("Failed to fetch logs");
      }
      const data = await response.json();
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    setIsLoading(true);
    fetchLogs();

    const interval = setInterval(fetchLogs, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const uniqueUsers = Array.from(
    new Map(
      logs.map((log) => [
        log.user_id,
        { id: log.user_id, name: log.name, email: log.email },
      ]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesUser = userFilter === "all" || log.user_id === userFilter;
    return matchesAction && matchesUser;
  });

  const formatDetailsSummary = (details: Record<string, unknown> | null) => {
    if (!details) return null;
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  };

  return (
    <main className="p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">
            Live activity feed across the dashboard
            {!isLoading && (
              <span className="ml-2 inline-flex items-center gap-1">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                </span>
                <span className="text-xs text-green-600 dark:text-green-400">
                  Live
                </span>
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectItem value="all">All users</SelectItem>
              {uniqueUsers.map(({ id, name, email }) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All actions</SelectItem>
              {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="h-6 w-24 rounded bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-muted" />
                    <div className="h-3 w-64 rounded bg-muted" />
                  </div>
                  <div className="h-3 w-32 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {actionFilter === "all" && userFilter === "all"
                ? "No audit logs yet"
                : "No logs match the selected filters"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    User
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const actionInfo = ACTION_LABELS[log.action] ?? {
                    label: log.action,
                    color: "bg-muted text-muted-foreground",
                  };
                  const summary = formatDetailsSummary(log.details);
                  const isExpanded = expandedRows.has(log.id);
                  const hasDetails =
                    !!log.details && Object.keys(log.details).length > 0;

                  return (
                    <Fragment key={log.id}>
                      <tr className="border-b transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground tabular-nums align-top">
                          {formatTime(log.event_time)}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${actionInfo.color}`}
                          >
                            {actionInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div>
                            <p className="font-medium truncate max-w-48">
                              {log.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-48">
                              {log.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {hasDetails ? (
                            <div className="flex items-start gap-1.5">
                              <button
                                onClick={() => toggleRow(log.id)}
                                className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="size-3.5" />
                                ) : (
                                  <ChevronRight className="size-3.5" />
                                )}
                              </button>
                              <div className="min-w-0">
                                {isExpanded ? (
                                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                                    {Object.entries(log.details!).map(
                                      ([key, value]) => (
                                        <Fragment key={key}>
                                          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                            {key}
                                          </span>
                                          <span className="text-xs text-foreground break-all">
                                            {typeof value === "object" &&
                                            value !== null
                                              ? JSON.stringify(value, null, 2)
                                              : String(value ?? "—")}
                                          </span>
                                        </Fragment>
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground truncate max-w-56 block">
                                    {summary}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
