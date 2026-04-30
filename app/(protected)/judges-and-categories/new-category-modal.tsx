"use client";

import { useId, useRef, useState } from "react";
import { CategoryTypeSelectField } from "@/components/category-type-select-field";
import { CsvImportFormSection } from "@/components/csv-import-form-section";
import { TwoModeCreateDialog } from "@/components/two-mode-create-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFooter, FormMessage } from "@/components/form-dialog";
import { parseCSV } from "@/lib/csv-parser";
import { type CategoryType, createCategoriesBulk, createCategory } from "./actions";
import { useSubmissionState } from "./use-submission-state";

const CATEGORY_TYPES: CategoryType[] = ["Sponsor", "Inhouse", "General"];

export function NewCategoryModal() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const { isLoading, error, success, start, finish } = useSubmissionState(() => setOpen(false));

  const singleFormRef = useRef<HTMLFormElement>(null);
  const bulkFormRef = useRef<HTMLFormElement>(null);
  const [typeValue, setTypeValue] = useState<CategoryType>("General");

  const handleSingleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    start();

    const formData = new FormData(e.currentTarget);
    const id = formData.get("shortcode") as string;
    const name = formData.get("name") as string;
    const type = typeValue;

    const result = await createCategory({
      id,
      name,
      type,
    });

    if (result.success) {
      singleFormRef.current?.reset();
      setTypeValue("General");
    }

    finish(result, "Category created successfully!", "Failed to create category");
  };

  const handleBulkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    start();

    const csvText = new FormData(e.currentTarget).get("csv") as string;

    const result_ = parseCSV(
      csvText,
      [
        { name: "id" },
        { name: "name" },
        {
          name: "type",
          validate: (value, lineNum) =>
            CATEGORY_TYPES.includes(value as CategoryType)
              ? null
              : `Line ${lineNum} has invalid type "${value}". Must be one of: ${CATEGORY_TYPES.join(", ")}`,
        },
      ],
      ([id, name, type]) => ({ id, name, type: type as CategoryType }),
    );

    if (result_.error) {
      finish({ success: false, error: result_.error }, "", "Failed to create categories");
      return;
    }

    const result = await createCategoriesBulk(result_.data);

    if (result.success) {
      bulkFormRef.current?.reset();
    }

    finish(result, `Created ${result.count} categories successfully!`, "Failed to create categories");
  };

  return (
    <TwoModeCreateDialog
      open={open}
      onOpenChange={setOpen}
      triggerLabel="New Category"
      title="Create New Category"
      description="Add a single category or import multiple via CSV."
      singleTabLabel="Single Category"
      bulkTabLabel="Bulk Import (CSV)"
      singleContent={(
        <form ref={singleFormRef} onSubmit={handleSingleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-shortcode`}>Shortcode (ID)</Label>
            <Input id={`${id}-shortcode`} name="shortcode" placeholder="e.g., SPONSOR_01" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>Name</Label>
            <Input id={`${id}-name`} name="name" placeholder="e.g., Best Sponsor Project" required />
          </div>

          <CategoryTypeSelectField
            id={`${id}-type`}
            value={typeValue}
            onValueChange={(value) => setTypeValue(value as CategoryType)}
            types={CATEGORY_TYPES}
          />

          {error && <FormMessage error={error} />}
          {success && <FormMessage success={success} />}

          <FormFooter
            isLoading={isLoading}
            onCancel={() => setOpen(false)}
            submitLabel="Create Category"
            loadingLabel="Creating..."
          />
        </form>
      )}
      bulkContent={(
        <form ref={bulkFormRef} onSubmit={handleBulkSubmit} className="space-y-4">
          <CsvImportFormSection
            id={`${id}-csv`}
            formatHint={<>Format: <code>id,name,type</code> (no header row)</>}
            placeholder={`SPONSOR_01,Best AI Project,Sponsor
SPONSOR_02,Best Web App,Sponsor
INHOUSE_01,Innovation Award,Inhouse`}
            infoTitle="Valid types:"
            infoContent={(
              <ul className="list-disc list-inside">
                <li>Sponsor</li>
                <li>Inhouse</li>
                <li>General</li>
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
