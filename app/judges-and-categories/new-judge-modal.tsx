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

    const formData = new FormData(e.currentTarget);
    const csvText = formData.get("csv") as string;

    // Parse CSV: name,email,categoryId (no header)
    const lines = csvText.trim().split("\n");
    const judges: { name: string; email: string; categoryId: string }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(",");
      if (parts.length < 3) {
        setError(`Line ${i + 1} is invalid: expected name,email,categoryId`);
        setIsLoading(false);
        return;
      }

      const name = parts[0].trim();
      const email = parts[1].trim();
      const categoryId = parts[2].trim();

      if (!name || !email || !categoryId) {
        setError(`Line ${i + 1} is missing name, email, or categoryId`);
        setIsLoading(false);
        return;
      }

      // Validate category exists
      const categoryExists = categories.some((c) => c.id === categoryId);
      if (!categoryExists) {
        setError(`Line ${i + 1}: Category "${categoryId}" does not exist`);
        setIsLoading(false);
        return;
      }

      judges.push({ name, email, categoryId });
    }

    if (judges.length === 0) {
      setError("No valid judges found in CSV");
      setIsLoading(false);
      return;
    }

    const result = await createJudgesBulk(judges);

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Judge
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Create New Judge</DialogTitle>
          <DialogDescription>Add a single judge or import multiple via CSV.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="single" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Judge</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import (CSV)</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-4">
            <form ref={singleFormRef} onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="judge-name">Name</Label>
                <Input id="judge-name" name="name" placeholder="e.g., John Doe" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="judge-email">Email</Label>
                <Input
                  id="judge-email"
                  name="email"
                  type="email"
                  placeholder="e.g., john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="judge-category">Category</Label>
                <Select value={categoryValue} onValueChange={setCategoryValue} name="categoryId">
                  <SelectTrigger id="judge-category">
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
                  {isLoading ? "Creating..." : "Create Judge"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="bulk" className="mt-4">
            <form ref={bulkFormRef} onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="judge-csv">CSV Data</Label>
                <p className="text-xs text-muted-foreground">
                  Format: <code>name,email,categoryId</code> (no header row)
                </p>
                <Textarea
                  id="judge-csv"
                  name="csv"
                  placeholder={`John Doe,john@example.com,SPONSOR_01
Jane Smith,jane@example.com,INHOUSE_01
Bob Wilson,bob@example.com,SPONSOR_02`}
                  className="min-h-37.5 font-mono text-sm"
                  required
                />
              </div>

              <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                <p className="font-medium mb-1">Available Categories:</p>
                <ul className="list-disc list-inside max-h-25 overflow-y-auto">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <code>{c.id}</code> - {c.name}
                    </li>
                  ))}
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
