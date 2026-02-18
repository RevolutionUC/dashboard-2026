import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  categories,
  evaluations,
  judgeGroups,
  judges,
  projects,
} from "@/lib/db/schema";
import { ScoringInterface } from "./scoring-interface";

interface ProjectWithScores {
  id: string;
  name: string;
  location: string;
  location2: string;
  scores: (number | null)[];
  categoryRelevance: number;
}

export default async function JudgingPortalPage({
  params,
}: {
  params: Promise<{ judgeID: string }>;
}) {
  const { judgeID } = await params;

  const judge = await db
    .select({
      id: judges.id,
      name: judges.name,
      judgeGroupId: judges.judgeGroupId,
      categoryId: judges.categoryId,
      judgingPhase: judges.judgingPhase,
    })
    .from(judges)
    .where(eq(judges.id, judgeID))
    .limit(1);

  if (judge.length === 0) {
    notFound();
  }

  const judgeInfo = judge[0];

  if (judgeInfo.judgingPhase === "finalized") {
    redirect("/judgingportal/finished");
  }

  // Get category and judge group info
  const [categoryInfo, judgeGroupInfo] = await Promise.all([
    db
      .select({
        name: categories.name,
        type: categories.type,
      })
      .from(categories)
      .where(eq(categories.id, judgeInfo.categoryId))
      .limit(1),
    judgeInfo.judgeGroupId
      ? db
          .select({
            name: judgeGroups.name,
          })
          .from(judgeGroups)
          .where(eq(judgeGroups.id, judgeInfo.judgeGroupId))
          .limit(1)
      : Promise.resolve([]),
  ]);

  const categoryName = categoryInfo[0]?.name ?? "Unknown";
  const categoryType = categoryInfo[0]?.type ?? "General";
  const judgeGroupName = judgeGroupInfo[0]?.name ?? "Unknown";

  let assignedProjects: ProjectWithScores[] = [];

  // Load evaluations for this judge with project details
  const evaluationRows = await db
    .select({
      projectId: evaluations.projectId,
      projectName: projects.name,
      projectLocation: projects.location,
      projectLocation2: projects.location2,
      scores: evaluations.scores,
      categoryRelevance: evaluations.categoryRelevance,
    })
    .from(evaluations)
    .innerJoin(projects, eq(evaluations.projectId, projects.id))
    .where(eq(evaluations.judgeId, judgeID))
    .orderBy(projects.name);

  assignedProjects = evaluationRows.map((row) => ({
    id: row.projectId,
    name: row.projectName,
    location: row.projectLocation,
    location2: row.projectLocation2,
    scores: row.scores || [null, null, null],
    categoryRelevance: row.categoryRelevance,
  }));

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Judging Portal</h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome, {judgeInfo.name}
          </p>
        </div>

        <div className="mb-4 space-y-2 rounded-lg bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Category:</span>
            <span className="font-semibold text-slate-900">{categoryName}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Judge Group:</span>
            <span className="font-semibold text-slate-900">
              {judgeGroupName}
            </span>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-slate-600">
            You have{" "}
            <span className="font-semibold text-slate-900">
              {assignedProjects.length}
            </span>{" "}
            projects to evaluate
          </p>
        </div>

        {assignedProjects.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center shadow-sm">
            <p className="text-slate-600">
              No projects assigned to evaluate yet.
            </p>
          </div>
        ) : (
          <ScoringInterface
            projects={assignedProjects}
            judgeId={judgeID}
            categoryType={categoryType}
          />
        )}
      </div>
    </div>
  );
}
