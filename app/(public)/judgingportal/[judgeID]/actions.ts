"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { evaluations, judges } from "@/lib/db/schema";

async function updateEvaluationAndRevalidate(
  judgeId: string,
  projectId: string,
  patch: Partial<typeof evaluations.$inferInsert>,
  logPrefix: string,
  errorMessage: string,
) {
  try {
    await db
      .update(evaluations)
      .set(patch)
      .where(
        and(
          eq(evaluations.judgeId, judgeId),
          eq(evaluations.projectId, projectId),
        ),
      );

    revalidatePath(`/judgingportal/${judgeId}`);
    return { success: true };
  } catch (error) {
    console.error(logPrefix, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : errorMessage,
    };
  }
}

export async function saveRanking(
  judgeId: string,
  projectId: string,
  bordaScore: number,
) {
  try {
    await db
      .update(evaluations)
      .set({ categoryBordaScore: bordaScore })
      .where(
        and(
          eq(evaluations.judgeId, judgeId),
          eq(evaluations.projectId, projectId),
        ),
      );

    revalidatePath(`/judgingportal/${judgeId}/ranking`);

    return { success: true };
  } catch (error) {
    console.error("Error saving ranking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save ranking",
    };
  }
}

export async function resetAllRankings(judgeId: string) {
  try {
    await db
      .update(evaluations)
      .set({ categoryBordaScore: 0 })
      .where(eq(evaluations.judgeId, judgeId));

    revalidatePath(`/judgingportal/${judgeId}/ranking`);

    return { success: true };
  } catch (error) {
    console.error("Error resetting rankings:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reset rankings",
    };
  }
}

export async function finalizeRankings(judgeId: string) {
  try {
    await db
      .update(judges)
      .set({ judgingPhase: "finalized" })
      .where(eq(judges.id, judgeId));

    revalidatePath(`/judgingportal/${judgeId}`);
    revalidatePath(`/judgingportal/${judgeId}/ranking`);

    return { success: true };
  } catch (error) {
    console.error("Error finalizing rankings:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to finalize rankings",
    };
  }
}

export async function saveEvaluationScore(
  judgeId: string,
  projectId: string,
  scoreIndex: number,
  score: number,
) {
  if (scoreIndex < 0 || scoreIndex > 2 || score < 1 || score > 5) {
    return { success: false, error: "Invalid score or scoreIndex" };
  }

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
  if (relevance < 1 || relevance > 5) {
    return { success: false, error: "Invalid relevance value" };
  }

  return updateEvaluationAndRevalidate(
    judgeId,
    projectId,
    { categoryRelevance: relevance },
    "Error saving category relevance:",
    "Failed to save category relevance",
  );
}

export async function saveNote(
  judgeId: string,
  projectId: string,
  note: string,
) {
  if (note.length > 10000) {
    return { success: false, error: "Note cannot exceed 10000 characters" };
  }

  return updateEvaluationAndRevalidate(
    judgeId,
    projectId,
    { note },
    "Error saving note:",
    "Failed to save note",
  );
}
