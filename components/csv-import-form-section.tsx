"use client";

import { FormFooter, FormMessage } from "@/components/form-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CsvImportFormSectionProps {
  id: string;
  formatHint: React.ReactNode;
  placeholder: string;
  infoTitle: string;
  infoContent: React.ReactNode;
  error: string | null;
  success: string | null;
  isLoading: boolean;
  onCancel: () => void;
  submitLabel: string;
  loadingLabel: string;
}

export function CsvImportFormSection({
  id,
  formatHint,
  placeholder,
  infoTitle,
  infoContent,
  error,
  success,
  isLoading,
  onCancel,
  submitLabel,
  loadingLabel,
}: CsvImportFormSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={id}>CSV Data</Label>
        <p className="text-xs text-muted-foreground">{formatHint}</p>
        <Textarea
          id={id}
          name="csv"
          placeholder={placeholder}
          className="min-h-37.5 font-mono text-sm"
          required
        />
      </div>

      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
        <p className="font-medium mb-1">{infoTitle}</p>
        {infoContent}
      </div>

      {error && <FormMessage error={error} />}
      {success && <FormMessage success={success} />}

      <FormFooter
        isLoading={isLoading}
        onCancel={onCancel}
        submitLabel={submitLabel}
        loadingLabel={loadingLabel}
      />
    </>
  );
}
