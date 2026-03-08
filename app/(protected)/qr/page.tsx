"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { QRScanner, ScanResult } from "@/components/qr-scanner";
import {
  type ScannerMode,
  type ScanStatus,
  type Participant,
  type Event,
  MODE_CONFIG,
  parseQRCode,
  fetchEvents,
  registerScan,
  fetchUser,
} from "@/lib/qr-scanner/data";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 2000;

export default function QRScannerPage() {
  const [mode, setModeState] = useState<ScannerMode>("checkin");
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Events for workshop/food modes
  const [events, setEvents] = useState<{ workshops: Event[]; food: Event[] }>({
    workshops: [],
    food: [],
  });
  const [selectedEventId, setSelectedEventIdState] = useState("");

  // Refs — always current, never stale inside callbacks
  const lastScanRef = useRef<{ id: string; time: number } | null>(null);
  const isLockedRef = useRef(false);
  const modeRef = useRef<ScannerMode>(mode);
  const selectedEventIdRef = useRef(selectedEventId);

  // Wrappers that sync state + ref simultaneously (no useEffect lag)
  const setMode = useCallback((m: ScannerMode) => {
    modeRef.current = m;
    setModeState(m);
  }, []);

  const setSelectedEventId = useCallback((id: string) => {
    selectedEventIdRef.current = id;
    setSelectedEventIdState(id);
  }, []);

  // Load events on mount
  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch((err: Error) => console.error("Failed to load events:", err));
  }, []);

  const reset = useCallback(() => {
    isLockedRef.current = false;
    lastScanRef.current = null;
    setStatus("idle");
    setParticipant(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  // Reset when mode changes
  useEffect(() => {
    reset();
    setSelectedEventId("");
  }, [mode, reset, setSelectedEventId]);

  const currentEvents = mode === "workshop" ? events.workshops : events.food;
  const selectedEvent =
    currentEvents.find((e) => e.id === selectedEventId) || null;

  const handleScan = useCallback(
    async (rawValue: string) => {
      // LOCK — must be the very first check and set. Uses a ref so it is
      // never stale no matter when this callback was created.
      if (isLockedRef.current) return;
      isLockedRef.current = true;

      // Read mode and eventId from refs so we never have stale closure values
      const currentMode = modeRef.current;
      const currentEventId = selectedEventIdRef.current;

      // Require event selection for workshop/food
      if (
        (currentMode === "workshop" || currentMode === "food") &&
        !currentEventId
      ) {
        setError(`Select a ${currentMode} first`);
        setStatus("error");
        // leave locked — staff must dismiss the error before scanning again
        return;
      }

      // Debounce: same QR within 2s is a no-op — unlock and bail
      const now = Date.now();
      if (
        lastScanRef.current &&
        lastScanRef.current.id === rawValue &&
        now - lastScanRef.current.time < DEBOUNCE_MS
      ) {
        isLockedRef.current = false;
        return;
      }
      lastScanRef.current = { id: rawValue, time: now };

      setIsProcessing(true);
      setError(null);

      try {
        const user_id = parseQRCode(rawValue);
        const data = await fetchUser(user_id);
        setParticipant(data);
        setStatus("scanning");
        // leave locked — participant card is showing, must be confirmed or cancelled
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Invalid QR code");
        setStatus("error");
        // leave locked — error card must be dismissed via Try Again
      } finally {
        setIsProcessing(false);
      }
    },
    [], // no dependencies — everything is read from refs
  );

  const handleConfirm = useCallback(async () => {
    if (!participant) return;

    setIsProcessing(true);
    try {
      await registerScan(
        participant.user_id,
        modeRef.current,
        modeRef.current !== "checkin" ? selectedEventIdRef.current : undefined,
      );
      setStatus("success");
      if (modeRef.current === "checkin") {
        setParticipant((p) =>
          p ? { ...p, checkedIn: true, status: "CHECKED_IN" } : null,
        );
      }
      // leave locked — success card must be dismissed via Scan Next
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setStatus("error");
      // leave locked — error card must be dismissed
    } finally {
      setIsProcessing(false);
    }
  }, [participant]);

  const handleCancel = useCallback(() => {
    reset();
  }, [reset]);

  const config = MODE_CONFIG[mode];
  const scannerDisabled = isProcessing;
  const scannerLocked = !isProcessing && status !== "idle";

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className={cn("p-4 text-white text-center", config.bgClass)}>
        <h1 className="text-xl font-bold">{config.label} Mode</h1>
      </header>

      {/* Mode tabs */}
      <div className="flex border-b bg-white">
        {(["checkin", "workshop", "food"] as const).map((m) => {
          const c = MODE_CONFIG[m];
          const isActive = mode === m;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-3 px-4 font-medium transition-colors",
                isActive
                  ? `border-b-2 ${c.borderClass} ${c.textClass}`
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Event selector for workshop/food */}
      {(mode === "workshop" || mode === "food") && (
        <div className="px-4 py-3 bg-white border-b">
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              if (status !== "idle") reset();
            }}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">-- Select {mode} --</option>
            {currentEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
                {event.location ? ` (${event.location})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col p-4 gap-4">
        <QRScanner
          onScan={handleScan}
          disabled={scannerDisabled}
          locked={scannerLocked}
        />

        <div className="w-full max-w-md mx-auto">
          <ScanResult
            status={status}
            participant={participant}
            error={error}
            mode={mode}
            selectedEvent={selectedEvent}
            isProcessing={isProcessing}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 bg-white border-t text-center text-sm text-gray-500">
        RevolutionUC QR Scanner
      </footer>
    </div>
  );
}
