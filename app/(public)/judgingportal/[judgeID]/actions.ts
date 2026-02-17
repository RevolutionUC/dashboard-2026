"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { evaluations } from "@/lib/db/schema";

export async function saveEvaluationScore(
  judgeId: string,
  projectId: string,
  scoreIndex: number,
  score: number,
) {
  try {
    // Get existing evaluation
    const existingEval = await db
      .select({ scores: evaluations.scores })
      .from(evaluations)
      .where(
        and(
          eq(evaluations.judgeId, judgeId),
          eq(evaluations.projectId, projectId),
        ),
      )
      .limit(1);

    if (existingEval.length === 0) {
      return {
        success: false,
        error: "Evaluation record not found",
      };
    }

    // Get current scores or initialize with nulls
    const currentScores = existingEval[0].scores || [null, null, null];
    const newScores = [...currentScores];
    newScores[scoreIndex] = score;

    // Update the evaluation
    await db
      .update(evaluations)
      .set({ scores: newScores as number[] })
      .where(
        and(
          eq(evaluations.judgeId, judgeId),
          eq(evaluations.projectId, projectId),
        ),
      );

    revalidatePath(`/judgingportal/${judgeId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error saving evaluation score:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save evaluation score",
    };
  }
}

export async function saveCategoryRelevance(
  judgeId: string,
  projectId: string,
  relevance: number,
) {
  try {
    // Update the evaluation with category relevance
    await db
      .update(evaluations)
      .set({ categoryRelevance: relevance })
      .where(
        and(
          eq(evaluations.judgeId, judgeId),
          eq(evaluations.projectId, projectId),
        ),
      );

    revalidatePath(`/judgingportal/${judgeId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error saving category relevance:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save category relevance",
    };
  }
}
