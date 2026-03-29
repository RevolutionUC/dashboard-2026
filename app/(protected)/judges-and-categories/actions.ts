"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assertAuthorization } from "@/lib/auth";
import { withAuth } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import { assignments, categories, judgeGroups, judges } from "@/lib/db/schema";

export type CategoryType = "Sponsor" | "Inhouse" | "General" | "MLH";

interface CreateCategoryInput {
  id: string;
  name: string;
  type: CategoryType;
}

export const createCategory = withAuth(
  async (data: CreateCategoryInput) => {
    await db.insert(categories).values({
      id: data.id,
      name: data.name,
      type: data.type,
    });
    return {};
  },
  "create category",
  "/judges-and-categories",
);

interface BulkCreateCategoryInput {
  id: string;
  name: string;
  type: CategoryType;
}

export const createCategoriesBulk = withAuth(
  async (data: BulkCreateCategoryInput[]) => {
    await db.insert(categories).values(data);
    return { count: data.length };
  },
  "create categories",
  "/judges-and-categories",
);

interface UpdateCategoryInput {
  id: string;
  newId?: string;
  name: string;
  type: CategoryType;
}

export const updateCategory = withAuth(
  async (data: UpdateCategoryInput) => {
    await db
      .update(categories)
      .set({
        id: data.newId ?? data.id,
        name: data.name,
        type: data.type,
      })
      .where(eq(categories.id, data.id));
    return { newId: data.newId || data.id };
  },
  "update category",
  "/judges-and-categories",
);

interface CreateJudgeInput {
  name: string;
  email: string;
  categoryId: string;
}

export const createJudge = withAuth(
  async (data: CreateJudgeInput) => {
    await db.insert(judges).values({
      name: data.name,
      email: data.email,
      categoryId: data.categoryId,
    });
    return {};
  },
  "create judge",
  "/judges-and-categories",
);

interface BulkCreateJudgeInput {
  name: string;
  email: string;
  categoryId: string;
}

export const createJudgesBulk = withAuth(
  async (data: BulkCreateJudgeInput[]) => {
    await db.insert(judges).values(data);
    return { count: data.length };
  },
  "create judges",
  "/judges-and-categories",
);

export async function updateJudgeAction(
  prevState: { success?: boolean; error?: string } | null,
  formData: FormData,
) {
  await assertAuthorization();

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

export async function toggleJudgeCheckinAction(judgeId: string) {
  await assertAuthorization();

  try {
    const [judge] = await db
      .select({ isCheckedin: judges.isCheckedin })
      .from(judges)
      .where(eq(judges.id, judgeId));

    if (!judge) {
      return { success: false, error: "Judge not found" };
    }

    await db
      .update(judges)
      .set({ isCheckedin: !judge.isCheckedin })
      .where(eq(judges.id, judgeId));

    revalidatePath("/judges-and-categories");
    return { success: true };
  } catch (error) {
    console.error("Error toggling judge checkin:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to toggle checkin",
    };
  }
}

export async function deleteAbsentJudgesAction() {
  await assertAuthorization();

  try {
    const result = await db
      .delete(judges)
      .where(eq(judges.isCheckedin, false));

    revalidatePath("/judges-and-categories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting absent judges:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete absent judges",
    };
  }
}

interface JudgeWithCategory {
  id: string;
  name: string;
  email: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    type: CategoryType;
  };
}

interface JudgeGroupInfo {
  categoryId: string;
  members: JudgeWithCategory[];
  name: string;
}

export async function assignJudgesToGroups() {
  try {
    await assertAuthorization();

    const allJudges = await db
      .select({
        id: judges.id,
        name: judges.name,
        email: judges.email,
        categoryId: judges.categoryId,
        category: {
          id: categories.id,
          name: categories.name,
          type: categories.type,
        },
      })
      .from(judges)
      .innerJoin(categories, eq(judges.categoryId, categories.id));

    const allCategories = await db
      .select({ id: categories.id })
      .from(categories)
      .orderBy(categories.id);

    // Group judges by category
    const judgesByCategories = allJudges.reduce(
      (acc, judge) => {
        const categoryId = judge.categoryId;
        if (!acc.has(categoryId)) {
          acc.set(categoryId, []);
        }
        acc.get(categoryId)!.push(judge);
        return acc;
      },
      new Map() as Map<string, JudgeWithCategory[]>,
    );

    // Judge group organization logic
    const judgeGroupsToCreate: JudgeGroupInfo[] = [];

    for (const [categoryId, judgesOfThisCategory] of judgesByCategories) {
      const category = judgesOfThisCategory[0].category;

      // If category type is 'Sponsor' or 'MLH', put all judges of that category into one group
      if (category.type === "Sponsor" || category.type === "MLH") {
        judgeGroupsToCreate.push({
          categoryId,
          members: judgesOfThisCategory,
          name: "PLACEHOLDER",
        });
      } else {
        // Chunk into groups of two for other categories
        for (let i = 0; i < judgesOfThisCategory.length; i += 2) {
          judgeGroupsToCreate.push({
            categoryId,
            members: judgesOfThisCategory.slice(i, i + 2),
            name: "",
          });
        }
      }
    }

    // Assign names to groups
    const judgeGroupCountByCategory: Record<string, number> = {};
    const categoryIndex = new Map(
      allCategories.map((c, index) => [c.id, index]),
    );

    for (const group of judgeGroupsToCreate) {
      const count = (judgeGroupCountByCategory[group.categoryId] || 0) + 1;
      judgeGroupCountByCategory[group.categoryId] = count;

      const firstChar = String.fromCharCode(
        65 + (categoryIndex.get(group.categoryId) ?? -1),
      );
      const secondChar = count.toString();

      group.name = `${firstChar}${secondChar}`;
    }

    await db.transaction(async (tx) => {
      await tx.delete(judgeGroups);

      const groupValues = judgeGroupsToCreate.map((g) => ({
        name: g.name,
        categoryId: g.categoryId,
      }));

      const createdGroups = await tx
        .insert(judgeGroups)
        .values(groupValues)
        .returning({ id: judgeGroups.id, name: judgeGroups.name });

      const createdGroupsByName = new Map(createdGroups.map((g) => [g.name, g.id]));

      // After inserting judge group, we assign the created judgeGroupId back to the correct individual judges
      for (const group of judgeGroupsToCreate) {
        const createdGroupId = createdGroupsByName.get(group.name);
        if (!createdGroupId) continue;

        const membersOfThisGroup = group.members.map((j) => j.id);
        await tx
          .update(judges)
          .set({ judgeGroupId: createdGroupId })
          .where(inArray(judges.id, membersOfThisGroup));
      }
    });

    revalidatePath("/judges-and-categories");
    return {
      success: true,
      groupCount: judgeGroupsToCreate.length,
    };
  } catch (error) {
    console.error("Error assigning judges to groups:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to assign judges to groups",
    };
  }
}

interface TransferJudgeInput {
  judgeId: string;
  targetGroupId: number;
}

export const transferJudgeToGroup = withAuth(
  async (data: TransferJudgeInput) => {
    const [judge] = await db
      .select({ judgeGroupId: judges.judgeGroupId })
      .from(judges)
      .where(eq(judges.id, data.judgeId));

    if (!judge || !judge.judgeGroupId) {
      return { success: false, error: "Judge is not assigned to a group" };
    }

    const existingAssignments = await db
      .select()
      .from(assignments)
      .limit(1);

    if (existingAssignments.length > 0) {
      return {
        success: false,
        error: "Cannot transfer: assignments already exist",
      };
    }

    await db
      .update(judges)
      .set({ judgeGroupId: data.targetGroupId })
      .where(eq(judges.id, data.judgeId));

    revalidatePath("/judges-and-categories");
    return { success: true };
  },
  "transfer judge to group",
  "/judges-and-categories",
);

