"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";

interface QRScannerProps {
  onScan: (value: string) => void;
  disabled?: boolean;
  locked?: boolean;
}

export function QRScanner({ onScan, disabled, locked }: QRScannerProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Keep refs for values that change — so the callback passed to Scanner
  // never changes reference and the library never restarts its internal
  // requestAnimationFrame loop.
  const onScanRef = useRef(onScan);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  const handleScan = useCallback((codes: IDetectedBarcode[]) => {
    if (codes.length > 0 && !disabledRef.current) {
      onScanRef.current(codes[0].rawValue);
    }
  }, []);

  const handleError = useCallback((error: unknown) => {
    console.error("Scanner error:", error);

    let message = "Camera error. Please reload the page.";

    if (error instanceof DOMException) {
      switch (error.name) {
        case "NotAllowedError":
          message =
            "Camera access was denied. Please allow camera permissions in your browser settings and reload the page.";
          break;
        case "NotFoundError":
          message =
            "No camera found on this device. Please connect a camera and reload.";
          break;
        case "NotReadableError":
          message =
            "Camera is in use by another app. Close the other app and reload.";
          break;
        case "OverconstrainedError":
          message =
            "Camera does not meet requirements. Try a different device.";
          break;
      }
    } else if (error instanceof Error) {
      if (
        error.message.toLowerCase().includes("permission") ||
        error.message.toLowerCase().includes("denied")
      ) {
        message =
          "Camera access was denied. Please allow camera permissions in your browser settings and reload the page.";
      }
    }

    setCameraError(message);
  }, []);

  // Safety-net: stop all camera streams when this component unmounts
  useEffect(() => {
    return () => {
      navigator.mediaDevices
        ?.enumerateDevices()
        .then(() => {
          const mediaElements = document.querySelectorAll("video");
          mediaElements.forEach((video) => {
            const stream = video.srcObject as MediaStream | null;
            if (stream) {
              stream.getTracks().forEach((track) => track.stop());
              video.srcObject = null;
            }
          });
        })
        .catch(() => {});
    };
  }, []);

  // Camera error state  full overlay with instructions
  if (cameraError) {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-square bg-gray-900 rounded-lg overflow-hidden flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-white text-lg font-bold mb-2">
          Camera Unavailable
        </h3>
        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
          {cameraError}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square bg-black rounded-lg overflow-hidden">
      <Scanner
        sound={false}
        allowMultiple
        onScan={handleScan}
        onError={handleError}
        styles={{
          container: { width: "100%", height: "100%" },
          video: { width: "100%", height: "100%", objectFit: "cover" },
        }}
      />
      {disabled && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
        </div>
      )}
      {locked && !disabled && (
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
