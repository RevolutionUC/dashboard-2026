import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  evaluations,
  projects,
} from "@/lib/db/schema";
import { getJudgeContext } from "./lib";
import { ScoringInterface } from "./scoring-interface";

interface ProjectWithScores {
  id: string;
  name: string;
  location: string;
  location2: string;
  url: string | null;
  status: string;
  scores: (number | null)[];
  categoryRelevance: number;
  note: string | null;
}

export default async function JudgingPortalPage({
  params,
}: {
  params: Promise<{ judgeID: string }>;
}) {
  const { judgeID } = await params;
  const { judgeInfo, categoryName, categoryType, judgeGroupName } =
    await getJudgeContext(judgeID);

  let assignedProjects: ProjectWithScores[] = [];

  // Load evaluations for this judge with project details
  const evaluationRows = await db
    .select({
      projectId: evaluations.projectId,
      projectName: projects.name,
      projectLocation: projects.location,
      projectLocation2: projects.location2,
      projectUrl: projects.url,
      projectStatus: projects.status,
      scores: evaluations.scores,
      categoryRelevance: evaluations.categoryRelevance,
      note: evaluations.note,
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
    url: row.projectUrl,
    status: row.projectStatus,
    scores: row.scores || [null, null, null],
    categoryRelevance: row.categoryRelevance,
    note: row.note,
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
            showNoteInput={true}
          />
        )}
      </div>
    </div>
  );
}
