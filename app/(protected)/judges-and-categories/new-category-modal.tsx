"use client";

import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
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
import { type CategoryType, createCategoriesBulk, createCategory } from "./actions";

const CATEGORY_TYPES: CategoryType[] = ["Sponsor", "Inhouse", "General"];

export function NewCategoryModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

    const formData = new FormData(e.currentTarget);
    const csvText = formData.get("csv") as string;

    // Parse CSV: id,name,type (no header)
    const lines = csvText.trim().split("\n");
    const categories: { id: string; name: string; type: CategoryType }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(",");
      if (parts.length < 3) {
        setError(`Line ${i + 1} is invalid: expected id,name,type`);
        setIsLoading(false);
        return;
      }

      const id = parts[0].trim();
      const name = parts[1].trim();
      const type = parts[2].trim() as CategoryType;

      if (!id || !name) {
        setError(`Line ${i + 1} is missing id or name`);
        setIsLoading(false);
        return;
      }

      if (!CATEGORY_TYPES.includes(type)) {
        setError(
          `Line ${i + 1} has invalid type "${type}". Must be one of: ${CATEGORY_TYPES.join(", ")}`,
        );
        setIsLoading(false);
        return;
      }

      categories.push({ id, name, type });
    }

    if (categories.length === 0) {
      setError("No valid categories found in CSV");
      setIsLoading(false);
      return;
    }

    const result = await createCategoriesBulk(categories);

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
                <Label htmlFor="shortcode">Shortcode (ID)</Label>
                <Input id="shortcode" name="shortcode" placeholder="e.g., SPONSOR_01" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="e.g., Best Sponsor Project" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={typeValue}
                  onValueChange={(value) => setTypeValue(value as CategoryType)}
                  name="type"
                >
                  <SelectTrigger id="type">
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

              {error && <div className="text-sm text-red-500">{error}</div>}
              {success && <div className="text-sm text-green-500">{success}</div>}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Category"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="bulk" className="mt-4">
            <form ref={bulkFormRef} onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv">CSV Data</Label>
                <p className="text-xs text-muted-foreground">
                  Format: <code>id,name,type</code> (no header row)
                </p>
                <Textarea
                  id="csv"
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

              {error && <div className="text-sm text-red-500">{error}</div>}
              {success && <div className="text-sm text-green-500">{success}</div>}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Upload className="mr-2 h-4 w-4" />
                  {isLoading ? "Importing..." : "Import CSV"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
