"use client";

import { useState } from "react";
import { CsvImportFormSection } from "@/components/csv-import-form-section";
import { JudgeCategorySelectField } from "@/components/judge-category-select-field";
import { TwoModeCreateDialog } from "@/components/two-mode-create-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFooter, FormMessage } from "@/components/form-dialog";
import { parseCSV } from "@/lib/csv-parser";
import { type CategoryType, createJudge, createJudgesBulk } from "./actions";
import { useSubmissionState } from "./use-submission-state";
import { useTwoModeCreateState } from "./use-two-mode-create-state";

interface NewJudgeModalProps {
  categories: {
    id: string;
    name: string;
    type: CategoryType;
  }[];
}

export function NewJudgeModal({ categories }: NewJudgeModalProps) {
  const { open, setOpen, id, singleFormRef, bulkFormRef } = useTwoModeCreateState();
  const { isLoading, error, success, start, finish, finishWithReset } = useSubmissionState(() => setOpen(false));
  const [categoryValue, setCategoryValue] = useState<string>("");
  const resetSingleForm = () => {
    singleFormRef.current?.reset();
    setCategoryValue("");
  };
  const resetBulkForm = () => {
    bulkFormRef.current?.reset();
  };

  const handleSingleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    start();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const categoryId = categoryValue;

    if (!categoryId) {
      finish({ success: false, error: "Please select a category" }, "", "Failed to create judge");
      return;
    }

    const result = await createJudge({
      name,
      email,
      categoryId,
    });

    finishWithReset(result, "Judge created successfully!", "Failed to create judge", resetSingleForm);
  };

  const handleBulkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    start();

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
      finish({ success: false, error: result_.error }, "", "Failed to create judges");
      return;
    }

    const result = await createJudgesBulk(result_.data);

    finishWithReset(result, `Created ${result.count} judges successfully!`, "Failed to create judges", resetBulkForm);
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

          <JudgeCategorySelectField
            id={`${id}-category`}
            categories={categories}
            value={categoryValue}
            onValueChange={setCategoryValue}
          />

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
