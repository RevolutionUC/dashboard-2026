"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import type { ScanStatus } from "@/lib/qr-scanner/data";

interface QRScannerViewProps {
  onScan: (detectedCodes: { rawValue: string }[]) => void;
  onError: (error: unknown) => void;
  scanStatus: ScanStatus;
}

export function QRScannerView({
  onScan,
  onError,
  scanStatus,
}: QRScannerViewProps) {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square bg-black rounded-lg overflow-hidden">
      <Scanner
        onScan={onScan}
        onError={(error) => {
          console.error("Scanner error:", error);
          onError(error);
        }}
        styles={{
          container: {
            width: "100%",
            height: "100%",
          },
          video: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
          },
        }}
        components={{
          finder: true,
        }}
      />

      {/* Loading overlay */}
      {scanStatus === "loading" && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
        </div>
      )}
    </div>
  );
}
