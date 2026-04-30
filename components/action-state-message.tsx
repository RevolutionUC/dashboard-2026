"use client";

interface ActionStateMessageProps {
  show: boolean;
  error?: string;
  success?: boolean;
  successText: string;
}

export function ActionStateMessage({
  show,
  error,
  success,
  successText,
}: ActionStateMessageProps) {
  if (!show) return null;
  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }
  if (success) {
    return <div className="text-sm text-green-500">{successText}</div>;
  }
  return null;
}
