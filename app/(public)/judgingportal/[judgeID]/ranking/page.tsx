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
import { RankingInterface } from "./ranking-interface";

interface EvaluationWithScore {
  projectId: string;
  projectName: string;
  projectLocation: string;
  projectLocation2: string;
  scores: number[];
  categoryRelevance: number;
  categoryBordaScore: number | null;
  calculatedScore: number;
}

export default async function RankingPage({
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
  const isSponsor = categoryType === "Sponsor";

  if (categoryType === "General") {
    redirect("/judgingportal/finished");
  }

  const evaluationRows = await db
    .select({
      projectId: evaluations.projectId,
      projectName: projects.name,
      projectLocation: projects.location,
      projectLocation2: projects.location2,
      scores: evaluations.scores,
      categoryRelevance: evaluations.categoryRelevance,
      categoryBordaScore: evaluations.categoryBordaScore,
    })
    .from(evaluations)
    .innerJoin(projects, eq(evaluations.projectId, projects.id))
    .where(eq(evaluations.judgeId, judgeID));

  const evaluationsWithScores: EvaluationWithScore[] = evaluationRows.map(
    (row) => {
      const scores = row.scores || [0, 0, 0];
      const totalScore = scores.reduce(
        (sum: number, s: number | null) => sum + (s || 0),
        0,
      );
      const relevanceMultiplier = isSponsor
        ? (row.categoryRelevance || 0) / 5
        : 1;
      const calculatedScore = totalScore * relevanceMultiplier;

      return {
        projectId: row.projectId,
        projectName: row.projectName,
        projectLocation: row.projectLocation,
        projectLocation2: row.projectLocation2,
        scores: scores as number[],
        categoryRelevance: row.categoryRelevance,
        categoryBordaScore: row.categoryBordaScore,
        calculatedScore,
      };
    },
  );

  evaluationsWithScores.sort((a, b) => b.calculatedScore - a.calculatedScore);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Ranking</h1>
          <p className="mt-1 text-sm text-slate-600">
            {judgeInfo.name} - {categoryName}
          </p>
        </div>

        <div className="mb-4 space-y-2 rounded-lg bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Judge Group:</span>
            <span className="font-semibold text-slate-900">
              {judgeGroupName}
            </span>
          </div>
        </div>

        <RankingInterface
          evaluations={evaluationsWithScores}
          judgeId={judgeID}
          categoryType={categoryType}
        />
      </div>
    </div>
  );
}
