"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ScannerHeader,
  ModeTabs,
  QRScannerView,
  ScanStatusDisplay,
  ScannerFooter,
} from "@/components/qr-scanner";
import {
  type ScannerMode,
  type ScanStatus,
  type ParticipantData,
  DEBOUNCE_TIME,
  getModeConfig,
  parseQRPayload,
  getParticipantInfo,
  registerParticipant,
} from "@/lib/qr-scanner/data";

export default function QRScannerPage() {
  const [mode, setMode] = useState<ScannerMode>("checkin");
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [participantData, setParticipantData] =
    useState<ParticipantData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [_, setSuccessMessage] = useState<string>("");
  const lastScannedRef = useRef<{ id: string; timestamp: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const modeConfig = getModeConfig(mode);

  // Reset state when mode changes
  useEffect(() => {
    resetScanState();
  }, [mode]);

  const resetScanState = useCallback(() => {
    setScanStatus("idle");
    setParticipantData(null);
    setErrorMessage("");
    setSuccessMessage("");
    setIsProcessing(false);
  }, []);

  const handleScan = useCallback(
    async (detectedCodes: { rawValue: string }[]) => {
      if (detectedCodes.length === 0 || isProcessing) return;

      const qrValue = detectedCodes[0].rawValue;
      const now = Date.now();

      // Debounce: ignore duplicate scans within DEBOUNCE_TIME
      if (
        lastScannedRef.current &&
        lastScannedRef.current.id === qrValue &&
        now - lastScannedRef.current.timestamp < DEBOUNCE_TIME
      ) {
        return;
      }

      lastScannedRef.current = { id: qrValue, timestamp: now };
      setIsProcessing(true);
      setScanStatus("loading");
      setErrorMessage("");
      setSuccessMessage("");
      setParticipantData(null);

      try {
        // Parse QR code - only contains participantId and metadata
        const qrPayload = parseQRPayload(qrValue);

        // Fetch full participant info from API
        const data = await getParticipantInfo(qrPayload.participantId);
        setParticipantData(data);
        setScanStatus("scanning");
      } catch (error) {
        setScanStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Invalid QR code. Please try again.",
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing],
  );

  const handleCheckIn = useCallback(async () => {
    if (!participantData) return;

    setIsProcessing(true);
    setScanStatus("loading");

    try {
      const result = await registerParticipant(
        participantData.participantId,
        "CHECKIN",
      );

      if (result.success) {
        setScanStatus("success");
        setSuccessMessage("Checked in successfully!");
        setParticipantData((prev) =>
          prev ? { ...prev, checkedIn: true } : null,
        );
      } else {
        setScanStatus("error");
        setErrorMessage(
          result.message || "Check-in failed. Please contact Web Team Lead.",
        );
      }
    } catch (error) {
      setScanStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Connection error. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  }, [participantData]);

  const handleCancel = useCallback(() => {
    resetScanState();
    lastScannedRef.current = null;
  }, [resetScanState]);

  const handleScanError = useCallback(() => {
    setErrorMessage("Camera error. Please check permissions.");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <ScannerHeader modeConfig={modeConfig} />

      <ModeTabs mode={mode} onModeChange={setMode} />

      <main className="flex-1 flex flex-col p-4 gap-4">
        <QRScannerView
          onScan={handleScan}
          onError={handleScanError}
          scanStatus={scanStatus}
        />

        <div className="w-full max-w-md mx-auto">
          <ScanStatusDisplay
            scanStatus={scanStatus}
            participantData={participantData}
            errorMessage={errorMessage}
            modeConfig={modeConfig}
            isProcessing={isProcessing}
            onCheckIn={handleCheckIn}
            onCancel={handleCancel}
          />
        </div>
      </main>

      <ScannerFooter />
    </div>
  );
}
