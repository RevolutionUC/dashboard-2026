"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categories, judgeGroups, judges } from "@/lib/db/schema";

export type CategoryType = "Sponsor" | "Inhouse" | "General" | "MLH";

interface CreateCategoryInput {
  id: string;
  name: string;
  type: CategoryType;
}

export async function createCategory(data: CreateCategoryInput) {
  try {
    await db.insert(categories).values({
      id: data.id,
      name: data.name,
      type: data.type,
    });

    revalidatePath("/judges-and-categories");
    return { success: true };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

interface BulkCreateCategoryInput {
  id: string;
  name: string;
  type: CategoryType;
}

export async function createCategoriesBulk(data: BulkCreateCategoryInput[]) {
  try {
    await db.insert(categories).values(data);

    revalidatePath("/judges-and-categories");
    return { success: true, count: data.length };
  } catch (error) {
    console.error("Error creating categories:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create categories",
    };
  }
}

interface UpdateCategoryInput {
  id: string;
  newId?: string;
  name: string;
  type: CategoryType;
}

export async function updateCategory(data: UpdateCategoryInput) {
  try {
    await db
      .update(categories)
      .set({
        id: data.newId ?? data.id,
        name: data.name,
        type: data.type,
      })
      .where(eq(categories.id, data.id));

    revalidatePath("/judges-and-categories");
    return { success: true, newId: data.newId || data.id };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

interface CreateJudgeInput {
  name: string;
  email: string;
  categoryId: string;
}

export async function createJudge(data: CreateJudgeInput) {
  try {
    await db.insert(judges).values({
      name: data.name,
      email: data.email,
      categoryId: data.categoryId,
    });

    revalidatePath("/judges-and-categories");
    return { success: true };
  } catch (error) {
    console.error("Error creating judge:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create judge",
    };
  }
}

interface BulkCreateJudgeInput {
  name: string;
  email: string;
  categoryId: string;
}

export async function createJudgesBulk(data: BulkCreateJudgeInput[]) {
  try {
    await db.insert(judges).values(data);

    revalidatePath("/judges-and-categories");
    return { success: true, count: data.length };
  } catch (error) {
    console.error("Error creating judges:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create judges",
    };
  }
}

export async function updateJudgeAction(
  prevState: { success?: boolean; error?: string } | null,
  formData: FormData,
) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!id || !name || !email || !categoryId) {
    return { error: "All fields are required" };
  }

  try {
    await db
      .update(judges)
      .set({ name, email, categoryId })
      .where(eq(judges.id, id));

    revalidatePath("/judges-and-categories");
    return { success: true };
  } catch (error) {
    console.error("Error updating judge:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update judge",
    };
  }
}
