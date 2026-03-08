"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { useEffect, useRef, useState } from "react";

interface QRScannerProps {
  onScan: (value: string) => void;
  disabled?: boolean;
  locked?: boolean;
}

export function QRScanner({ onScan, disabled, locked }: QRScannerProps) {
  const [showLockedWarning, setShowLockedWarning] = useState(false);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear warning as soon as the lock is lifted
  useEffect(() => {
    if (!locked) {
      setShowLockedWarning(false);
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
    }
  }, [locked]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, []);

  const triggerLockedWarning = () => {
    setShowLockedWarning(true);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    warningTimerRef.current = setTimeout(() => {
      setShowLockedWarning(false);
      warningTimerRef.current = null;
    }, 2500);
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square bg-black rounded-lg overflow-hidden">
      <Scanner
        // do not enable
        sound={false}
        onScan={(codes) => {
          if (codes.length === 0) return;
          if (disabled || locked) {
            if (locked && !disabled) triggerLockedWarning();
            return;
          }
          onScan(codes[0].rawValue);
        }}
        onError={(error) => console.error("Scanner error:", error)}
        styles={{
          container: { width: "100%", height: "100%" },
          video: { width: "100%", height: "100%", objectFit: "cover" },
        }}
        components={{ finder: true }}
      />
      {disabled && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
        </div>
      )}
      {showLockedWarning && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-3 flex items-center gap-2">
          <span className="text-yellow-400 text-lg leading-none">⚠</span>
          <p className="text-white text-sm font-medium leading-tight">
            Process the current participant or press Cancel before scanning
            again.
          </p>
        </div>
      )}
    </div>
  );
}
