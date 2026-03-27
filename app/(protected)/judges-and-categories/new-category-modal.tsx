"use client";

import { Plus, Upload } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FormFooter, FormMessage } from "@/components/form-dialog";
import { parseCSV } from "@/lib/csv-parser";
import { type CategoryType, createCategoriesBulk, createCategory } from "./actions";

const CATEGORY_TYPES: CategoryType[] = ["Sponsor", "Inhouse", "General"];

export function NewCategoryModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const id = useId();

  const singleFormRef = useRef<HTMLFormElement>(null);
  const bulkFormRef = useRef<HTMLFormElement>(null);
  const [typeValue, setTypeValue] = useState<CategoryType>("General");

  const handleSingleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const id = formData.get("shortcode") as string;
    const name = formData.get("name") as string;
    const type = typeValue;

    const result = await createCategory({
      id,
      name,
      type,
    });

    setIsLoading(false);

    if (result.success) {
      setSuccess("Category created successfully!");
      singleFormRef.current?.reset();
      setTypeValue("General");
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
      }, 1500);
    } else {
      setError(result.error || "Failed to create category");
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
      setError(result_.error);
      setIsLoading(false);
      return;
    }

    const result = await createCategoriesBulk(result_.data);

    setIsLoading(false);

    if (result.success) {
      setSuccess(`Created ${result.count} categories successfully!`);
      bulkFormRef.current?.reset();
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
      }, 1500);
    } else {
      setError(result.error || "Failed to create categories");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>Add a single category or import multiple via CSV.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="single" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Category</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import (CSV)</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-4">
            <form ref={singleFormRef} onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${id}-shortcode`}>Shortcode (ID)</Label>
                <Input id={`${id}-shortcode`} name="shortcode" placeholder="e.g., SPONSOR_01" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-name`}>Name</Label>
                <Input id={`${id}-name`} name="name" placeholder="e.g., Best Sponsor Project" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-type`}>Type</Label>
                <Select
                  value={typeValue}
                  onValueChange={(value) => setTypeValue(value as CategoryType)}
                  name="type"
                >
                  <SelectTrigger id={`${id}-type`}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
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
                submitLabel="Create Category"
                loadingLabel="Creating..."
              />
            </form>
          </TabsContent>

          <TabsContent value="bulk" className="mt-4">
            <form ref={bulkFormRef} onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${id}-csv`}>CSV Data</Label>
                <p className="text-xs text-muted-foreground">
                  Format: <code>id,name,type</code> (no header row)
                </p>
                <Textarea
                  id={`${id}-csv`}
                  name="csv"
                  placeholder={`SPONSOR_01,Best AI Project,Sponsor
SPONSOR_02,Best Web App,Sponsor
INHOUSE_01,Innovation Award,Inhouse`}
                  className="min-h-37.5 font-mono text-sm"
                  required
                />
              </div>

              <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                <p className="font-medium mb-1">Valid types:</p>
                <ul className="list-disc list-inside">
                  <li>Sponsor</li>
                  <li>Inhouse</li>
                  <li>General</li>
                </ul>
              </div>

              {error && <FormMessage error={error} />}
              {success && <FormMessage success={success} />}

              <FormFooter
                isLoading={isLoading}
                onCancel={() => setOpen(false)}
                submitLabel="Import CSV"
                loadingLabel="Importing..."
              />
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
