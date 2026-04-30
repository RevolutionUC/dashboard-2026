"use client";

interface FormErrorAlertProps {
  error: string | null;
}

export function FormErrorAlert({ error }: FormErrorAlertProps) {
  if (!error) return null;
  return (
    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
      {error}
    </div>
  );
}
