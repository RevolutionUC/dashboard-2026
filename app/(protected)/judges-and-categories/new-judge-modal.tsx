"use client";

import { useId, useRef, useState } from "react";
import { CsvImportFormSection } from "@/components/csv-import-form-section";
import { TwoModeCreateDialog } from "@/components/two-mode-create-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormFooter, FormMessage } from "@/components/form-dialog";
import { parseCSV } from "@/lib/csv-parser";
import { type CategoryType, createJudge, createJudgesBulk } from "./actions";

interface NewJudgeModalProps {
  categories: {
    id: string;
    name: string;
    type: CategoryType;
  }[];
}

export function NewJudgeModal({ categories }: NewJudgeModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const id = useId();

  const singleFormRef = useRef<HTMLFormElement>(null);
  const bulkFormRef = useRef<HTMLFormElement>(null);
  const [categoryValue, setCategoryValue] = useState<string>("");

  const handleSingleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const categoryId = categoryValue;

    if (!categoryId) {
      setError("Please select a category");
      setIsLoading(false);
      return;
    }

    const result = await createJudge({
      name,
      email,
      categoryId,
    });

    setIsLoading(false);

    if (result.success) {
      setSuccess("Judge created successfully!");
      singleFormRef.current?.reset();
      setCategoryValue("");
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
      }, 1500);
    } else {
      setError(result.error || "Failed to create judge");
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const csvText = new FormData(e.currentTarget).get("csv") as string;

    const result_ = parseCSV(
      csvText,
      [
        { name: "name" },
        { name: "email" },
        {
          name: "categoryId",
          validate: (value, lineNum) =>
            categories.some((c) => c.id === value)
              ? null
              : `Line ${lineNum}: Category "${value}" does not exist`,
        },
      ],
      ([name, email, categoryId]) => ({ name, email, categoryId }),
    );

    if (result_.error) {
      setError(result_.error);
      setIsLoading(false);
      return;
    }

    const result = await createJudgesBulk(result_.data);

    setIsLoading(false);

    if (result.success) {
      setSuccess(`Created ${result.count} judges successfully!`);
      bulkFormRef.current?.reset();
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
      }, 1500);
    } else {
      setError(result.error || "Failed to create judges");
    }
  };

  return (
    <TwoModeCreateDialog
      open={open}
      onOpenChange={setOpen}
      triggerLabel="New Judge"
      title="Create New Judge"
      description="Add a single judge or import multiple via CSV."
      singleTabLabel="Single Judge"
      bulkTabLabel="Bulk Import (CSV)"
      singleContent={(
        <form ref={singleFormRef} onSubmit={handleSingleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>Name</Label>
            <Input id={`${id}-name`} name="name" placeholder="e.g., John Doe" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-email`}>Email</Label>
            <Input
              id={`${id}-email`}
              name="email"
              type="email"
              placeholder="e.g., john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-category`}>Category</Label>
            <Select value={categoryValue} onValueChange={setCategoryValue} name="categoryId">
              <SelectTrigger id={`${id}-category`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <FormMessage error={error} />}
          {success && <FormMessage success={success} />}

          <FormFooter
            isLoading={isLoading}
            onCancel={() => setOpen(false)}
            submitLabel="Create Judge"
            loadingLabel="Creating..."
          />
        </form>
      )}
      bulkContent={(
        <form ref={bulkFormRef} onSubmit={handleBulkSubmit} className="space-y-4">
          <CsvImportFormSection
            id={`${id}-csv`}
            formatHint={<>Format: <code>name,email,categoryId</code> (no header row)</>}
            placeholder={`John Doe,john@example.com,SPONSOR_01
Jane Smith,jane@example.com,INHOUSE_01
Bob Wilson,bob@example.com,SPONSOR_02`}
            infoTitle="Available Categories:"
            infoContent={(
              <ul className="list-disc list-inside max-h-25 overflow-y-auto">
                {categories.map((c) => (
                  <li key={c.id}>
                    <code>{c.id}</code> - {c.name}
                  </li>
                ))}
              </ul>
            )}
            error={error}
            success={success}
            isLoading={isLoading}
            onCancel={() => setOpen(false)}
            submitLabel="Import CSV"
            loadingLabel="Importing..."
          />
        </form>
      )}
    />
  );
}
