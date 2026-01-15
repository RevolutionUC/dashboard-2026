// Types
export interface QRPayload {
  participantId: string;
  metadata?: Record<string, unknown>;
}

export interface ParticipantData {
  participantId: string;
  firstName: string;
  lastName: string;
  status: "CONFIRMED" | "WAITLISTED";
  checkedIn: boolean;
  metadata?: Record<string, unknown>;
}

export type ScanStatus = "idle" | "scanning" | "loading" | "success" | "error";
export type ScannerMode = "checkin" | "workshop" | "food";

export interface ModeConfig {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  hoverBg: string;
  lightBg: string;
}

// Constants
export const DEBOUNCE_TIME = 3000;

// Mode configurations
export const MODE_CONFIGS: Record<ScannerMode, ModeConfig> = {
  checkin: {
    label: "Check-in Mode",
    bgColor: "bg-green-600",
    textColor: "text-green-600",
    borderColor: "border-green-600",
    hoverBg: "hover:bg-green-700",
    lightBg: "bg-green-50",
  },
  workshop: {
    label: "Workshop Mode",
    bgColor: "bg-blue-600",
    textColor: "text-blue-600",
    borderColor: "border-blue-600",
    hoverBg: "hover:bg-blue-700",
    lightBg: "bg-blue-50",
  },
  food: {
    label: "Food Mode",
    bgColor: "bg-red-600",
    textColor: "text-red-600",
    borderColor: "border-red-600",
    hoverBg: "hover:bg-red-700",
    lightBg: "bg-red-50",
  },
};

// Helper function to get mode configuration
export function getModeConfig(mode: ScannerMode): ModeConfig {
  return MODE_CONFIGS[mode];
}

// Parse QR code payload - only contains participantId and metadata
export function parseQRPayload(qrValue: string): QRPayload {
  try {
    const parsed = JSON.parse(qrValue);
    // Handle different possible field names
    const participantId =
      parsed.participantId || parsed.Participant_ID || parsed.id;

    if (!participantId) {
      throw new Error("No participant ID found in QR code");
    }

    return {
      participantId: String(participantId),
      metadata: parsed.metadata,
    };
  } catch {
    // If not valid JSON, treat the raw value as the participant ID
    if (qrValue && qrValue.trim()) {
      return {
        participantId: qrValue.trim(),
      };
    }
    throw new Error("Invalid QR code format");
  }
}

// API functions
export async function getParticipantInfo(
  participantId: string,
): Promise<ParticipantData> {
  const response = await fetch(
    `/api/get-info?participantId=${encodeURIComponent(participantId)}`,
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 404) {
      throw new Error("No participant found for this QR code");
    }
    throw new Error(errorData.message || "Failed to fetch participant info");
  }

  const data = await response.json();
  return {
    participantId,
    firstName: data.FirstName,
    lastName: data.LastName,
    status: data.Status,
    checkedIn: data.checkedIn ?? false,
    metadata: data.participant_metadata,
  };
}

export async function registerParticipant(
  participantId: string,
  eventId: string,
): Promise<{ success: boolean; message: string }> {
  const response = await fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      participantId,
      eventID: eventId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to register participant");
  }

  const data = await response.json();
  return {
    success: data.Message === "REGISTERED",
    message: data.Message,
  };
}
