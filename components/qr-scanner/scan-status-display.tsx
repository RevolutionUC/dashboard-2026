"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ParticipantData, ModeConfig } from "@/lib/qr-scanner/data";

interface ScanStatusDisplayProps {
  scanStatus: "idle" | "scanning" | "loading" | "success" | "error";
  participantData: ParticipantData | null;
  errorMessage: string;
  modeConfig: ModeConfig;
  isProcessing: boolean;
  onCheckIn: () => void;
  onCancel: () => void;
}

function IdleState() {
  return (
    <div className="text-center p-6 bg-white rounded-lg shadow">
      <p className="text-gray-600">
        Point your camera at a participant&apos;s QR code to scan
      </p>
    </div>
  );
}

function ErrorState({
  errorMessage,
  onRetry,
}: {
  errorMessage: string;
  onRetry: () => void;
}) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 text-red-700 mb-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-semibold">Error</span>
      </div>
      <p className="text-red-600 mb-4">{errorMessage}</p>
      <Button
        onClick={onRetry}
        variant="outline"
        className="w-full border-red-300 text-red-600 hover:bg-red-100"
      >
        Retry
      </Button>
    </div>
  );
}

function SuccessState({
  participantData,
  onScanNext,
}: {
  participantData: ParticipantData;
  onScanNext: () => void;
}) {
  return (
    <div className="p-6 bg-green-50 border-2 border-green-500 rounded-lg">
      <div className="flex items-center justify-center gap-2 text-green-700 mb-4">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-center text-green-800 mb-2">Checked In!</h2>
      <p className="text-center text-green-700 text-lg mb-4">
        {participantData.firstName} {participantData.lastName}
      </p>
      <Button
        onClick={onScanNext}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        Scan Next
      </Button>
    </div>
  );
}

function ScanningState({
  participantData,
  modeConfig,
  isProcessing,
  onCheckIn,
  onCancel,
}: {
  participantData: ParticipantData;
  modeConfig: ModeConfig;
  isProcessing: boolean;
  onCheckIn: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Participant Header */}
      <div className={cn("p-4", modeConfig.lightBg)}>
        <h2 className="text-xl font-bold text-gray-800">
          {participantData.firstName} {participantData.lastName}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              participantData.status === "CONFIRMED"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            )}
          >
            {participantData.status}
          </span>
          {participantData.checkedIn && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Already Checked In
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        {participantData.status === "WAITLISTED" ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-center font-medium">
              ⚠️ This participant is on the waitlist
            </p>
            <p className="text-yellow-600 text-center text-sm mt-1">
              Check-in is not available for waitlisted participants
            </p>
          </div>
        ) : participantData.checkedIn ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-center font-medium">
              ✓ This participant has already checked in
            </p>
          </div>
        ) : (
          <Button
            onClick={onCheckIn}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
          >
            {isProcessing ? "Processing..." : "Check In"}
          </Button>
        )}

        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full"
          disabled={isProcessing}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function ScanStatusDisplay({
  scanStatus,
  participantData,
  errorMessage,
  modeConfig,
  isProcessing,
  onCheckIn,
  onCancel,
}: ScanStatusDisplayProps) {
  if (scanStatus === "idle") {
    return <IdleState />;
  }

  if (scanStatus === "error") {
    return <ErrorState errorMessage={errorMessage} onRetry={onCancel} />;
  }

  if (scanStatus === "success" && participantData) {
    return <SuccessState participantData={participantData} onScanNext={onCancel} />;
  }

  if (scanStatus === "scanning" && participantData) {
    return (
      <ScanningState
        participantData={participantData}
        modeConfig={modeConfig}
        isProcessing={isProcessing}
        onCheckIn={onCheckIn}
        onCancel={onCancel}
      />
    );
  }

  return null;
}
