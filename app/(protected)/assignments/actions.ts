"use server";

import { count, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assertAuthorization } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  assignments,
  categories,
  evaluations,
  judgeGroups,
  judges,
  submissions,
} from "@/lib/db/schema";
import { RotatingQueue } from "@/lib/rotating-queue";

const MINIMUM_JUDGES_PER_PROJECT = 6;

const SUGGESTED_JUDGE_GROUP_COUNT_PER_SUBMISSION_BASED_ON_CATEGORY_TYPE = {
  General: 1,
  Inhouse: 2,
  Sponsor: 1,
  MLH: 0,
} as const;

interface JudgeGroupWithCount {
  id: number;
  categoryId: string;
  judgeCount: number;
}

interface AssignmentToInsert {
  projectId: string;
  judgeGroupId: number;
}

export async function assignProjectsToJudgeGroups() {
  try {
    await assertAuthorization();

    // Find General category ID
    const generalCategory = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.type, "General"))
      .limit(1);

    let generalCategoryId: string;

    if (generalCategory.length === 0) {
      // Create the General category if not exists yet
      const newGeneralCategory = await db
        .insert(categories)
        .values({ id: "general", name: "General", type: "General" })
        .returning({ id: categories.id });
      generalCategoryId = newGeneralCategory[0].id;
    } else {
      generalCategoryId = generalCategory[0].id;
    }

    // Preconditions: Check minimum General judges
    const [{count: generalJudgesCount}] = await db
      .select({ count: count() })
      .from(judges)
      .where(eq(judges.categoryId, generalCategoryId));

    if (generalJudgesCount < MINIMUM_JUDGES_PER_PROJECT) {
      return {
        success: false,
        error: `There must be at least ${MINIMUM_JUDGES_PER_PROJECT} General judges. Currently have ${generalJudgesCount}.`,
      };
    }

    // Fetch all submissions with category info
    const allSubmissions = await db
      .select({
        projectId: submissions.projectId,
        categoryId: submissions.categoryId,
        categoryType: categories.type,
      })
      .from(submissions)
      .innerJoin(categories, eq(submissions.categoryId, categories.id));

    // Fetch all judge groups with judge counts
    const judgeGroupsWithCounts = await db
      .select({
        id: judgeGroups.id,
        categoryId: judgeGroups.categoryId,
        judgeCount: count(judges.id),
      })
      .from(judgeGroups)
      .leftJoin(judges, eq(judgeGroups.id, judges.judgeGroupId))
      .groupBy(judgeGroups.id, judgeGroups.categoryId);

    if (judgeGroupsWithCounts.length === 0) {
      return {
        success: false,
        error:
          "Need judge groups before assigning projects. Please create judge groups first.",
      };
    }

    // Phase 1: Assign submissions to judge groups based on category
    // We use round-robin to assign projects across judge groups.
    // So we create rotating queues of groups per category help easily distribute projects into different groups continously
    const groupsQueueByCategory = judgeGroupsWithCounts.reduce((acc, group) => {
      if (!acc.has(group.categoryId)) {
        acc.set(group.categoryId, new RotatingQueue<JudgeGroupWithCount>([]));
      }
      acc.get(group.categoryId)!.add(group);
      return acc;
    }, new Map<string, RotatingQueue<JudgeGroupWithCount>>());

    const assignmentList: Array<{ projectId: string; judgeGroup: JudgeGroupWithCount }> = [];

    for (const submission of allSubmissions) {
      const groupsQueue = groupsQueueByCategory.get(submission.categoryId);
      if (!groupsQueue || groupsQueue.length === 0) {
        continue; // Skip if no judge groups for this category
      }

      // Determine how many groups to assign to this project based on its category
      const howManyGroupsOfThisCategory = groupsQueue.length;
      const suggestedGroupCount = SUGGESTED_JUDGE_GROUP_COUNT_PER_SUBMISSION_BASED_ON_CATEGORY_TYPE[submission.categoryType] || 1;
      const howManyJudgeGroupsToAssign = Math.min(howManyGroupsOfThisCategory, suggestedGroupCount);

      // Continously rotate through available groups to asign project
      for (let i = 0; i < howManyJudgeGroupsToAssign; i++) {
        assignmentList.push({ projectId: submission.projectId, judgeGroup: groupsQueue.getNext() });
      }
    }

    // Phase 2: Assign additional General groups for projects with insufficient judges
    const assignmentsByProject = new Map<
      string,
      Array<{ projectId: string; judgeGroup: JudgeGroupWithCount }>
    >();

    // Fist, we organize assignments by projectId to see how many judges per project already
    for (const assignment of assignmentList) {
      if (!assignmentsByProject.has(assignment.projectId)) {
        assignmentsByProject.set(assignment.projectId, []);
      }
      assignmentsByProject.get(assignment.projectId)!.push(assignment);
    }

    const generalGroupQueue = groupsQueueByCategory.get("general");

    if (generalGroupQueue) {
      for (const [projectId, projectAssignments] of assignmentsByProject) {
        let howManyJudgesAlready = projectAssignments.reduce((sum, a) => sum + a.judgeGroup.judgeCount, 0);
        const alreadyUsedGroupIds = new Set(projectAssignments.map((a) => a.judgeGroup.id));

        // If less judges than desired minimum, we use a while loop to continously assign additional General groups until achieved desire count
        let safetyCounterToPreventInfiniteLoop = 0;
        while (howManyJudgesAlready < MINIMUM_JUDGES_PER_PROJECT && safetyCounterToPreventInfiniteLoop < 100) {
          const nextGeneralGroup = generalGroupQueue.getNext();

          if (alreadyUsedGroupIds.has(nextGeneralGroup.id)) continue

          assignmentList.push({ projectId, judgeGroup: nextGeneralGroup });
          alreadyUsedGroupIds.add(nextGeneralGroup.id);
          howManyJudgesAlready += nextGeneralGroup.judgeCount;

          safetyCounterToPreventInfiniteLoop += 1;
        }
      }
    }

    // Post-condition: Check that all projects have sufficient number of judges
    const finalAssignmentsByProject = new Map<string, number>();

    const judgeCountPerProject = assignmentList.reduce((acc, assignment) => {
      const currentCount = acc.get(assignment.projectId) || 0;
      acc.set(assignment.projectId, currentCount + assignment.judgeGroup.judgeCount);
      return acc;
    }, new Map<string, number>());

    const projectsWithInsufficientJudges: string[] = [];

    for (const [projectId, judgeCount] of judgeCountPerProject) {
      if (judgeCount < MINIMUM_JUDGES_PER_PROJECT) {
        projectsWithInsufficientJudges.push(projectId);
      }
    }

    if (projectsWithInsufficientJudges.length > 0) {
      const projectList = projectsWithInsufficientJudges.join('\n');
      return {
        success: false,
        error: `${projectsWithInsufficientJudges.length} project(s) have less than ${MINIMUM_JUDGES_PER_PROJECT} judges). Projects: ${projectList}`,
      };
    }

    // De-duplicate duplicated assignment because I am paranoid
    const seen = new Set<string>();

    const dedupedAssignmentList = assignmentList.filter((assignment) => {
      const key = `${assignment.judgeGroup.id}:${assignment.projectId}`;
      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });

    const assignmentsToInsert = dedupedAssignmentList.map(
      (a) => ({
        projectId: a.projectId,
        judgeGroupId: a.judgeGroup.id,
      }),
    );

    // Also Create evaluation records for each judge-project pair
    const allJudgeGroups = await db.query.judgeGroups.findMany({ with: { judges: true } });

    const judgesByGroupId = new Map(allJudgeGroups.map(g => [g.id, g.judges]));

    // Create evaluation records: From `assignments`, each (judgeId, projectId) pair is a unique evaluation
    const evaluationsToInsert = assignmentsToInsert.flatMap((assignment) => {
      const judges = judgesByGroupId.get(assignment.judgeGroupId) || [];

      return judges.map((judge) => ({
        projectId: assignment.projectId,
        judgeId: judge.id,
        categoryId: judge.categoryId,
      }));
    });

    await db.transaction(async (tx) => {
      await tx.delete(assignments);
      await tx.insert(assignments).values(assignmentsToInsert);
      await tx.delete(evaluations);
      if (evaluationsToInsert.length > 0) {
        await tx.insert(evaluations).values(evaluationsToInsert);
      }
    });

    revalidatePath("/assignments");

    return {
      success: true,
      count: assignmentsToInsert.length,
      projectsAssigned: finalAssignmentsByProject.size,
      evaluationsCreated: evaluationsToInsert.length,
    };
  } catch (error) {
    console.error("Error assigning submissions to judge groups:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to assign submissions to judge groups",
    };
  }
}
