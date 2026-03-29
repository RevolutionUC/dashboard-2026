"use client";

import { useEffect, useId, useRef, useState } from "react";
import { saveNote } from "./actions";

interface NoteInputProps {
  projectId: string;
  initialNote: string;
  judgeId: string;
}

export function NoteInput({
  projectId,
  initialNote,
  judgeId,
}: NoteInputProps) {
  const id = useId();
  const [note, setNote] = useState(initialNote);
  const [status, setStatus] = useState<"typing" | "saved" | "error" | null>(null);
  
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  const handleChange = (value: string) => {
    setNote(value);
    setStatus("typing");

    // 1. Debounce Logic: Clear the pending save if the user types again within 1s
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        await saveNote(judgeId, projectId, value);
        
        setStatus("saved");

        // It's a new status, so we clear any existing timeout associated with previous Status
        if (statusTimeoutRef.current) {
          clearTimeout(statusTimeoutRef.current);
        }

        // Set a new timer to hide the "saved" message after 2s of inactivity
        statusTimeoutRef.current = setTimeout(() => {
          setStatus(null);
        }, 2000);
      } catch (error) {
        console.error("Failed to save note", error);
        setStatus("error");
      }
    }, 1000); // Wait for 1s of silence before saving
  };

  // Cleanup: Cancel all timers if the component unmounts to prevent state updates on a dead component
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    };
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          Notes
        </label>
        {status && (
          <span className="text-xs text-muted-foreground">
            {status === "typing" ? "Typing..." : status === "error" ? "Failed to save" : "Note saved"}
          </span>
        )}
      </div>
      <textarea
        id={id}
        value={note}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add notes about this project..."
        className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        rows={6}
      />
    </>
  );
}
