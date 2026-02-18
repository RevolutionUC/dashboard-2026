import { asc, eq, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { evaluations, judges, projects } from "@/lib/db/schema";
import { ScoringsTable } from "./scorings-table";

interface EvaluationWithJudge {
  projectId: string;
  projectName: string | null;
  judgeId: string;
  judgeName: string | null;
  score1: number | null;
  score2: number | null;
  score3: number | null;
}

interface ProjectWithEvaluations {
  id: string;
  name: string;
  evaluations: EvaluationWithJudge[];
}

interface RankingEntry {
  rank: number;
  projectId: string;
  projectName: string;
  bordaScore: number;
  numJudges: number;
}

function calculateRankings(data: EvaluationWithJudge[]): RankingEntry[] {
  const judgeMap = new Map<string, (EvaluationWithJudge & { avg: number })[]>();

  for (const eval_ of data) {
    const avg =
      ((eval_.score1 ?? 0) + (eval_.score2 ?? 0) + (eval_.score3 ?? 0)) / 3;
    const entry = { ...eval_, avg };
    const existing = judgeMap.get(eval_.judgeId) ?? [];
    existing.push(entry);
    judgeMap.set(eval_.judgeId, existing);
  }

  const projectJudgedBy = new Map<string, Set<string>>();
  for (const eval_ of data) {
    const judges = projectJudgedBy.get(eval_.projectId) ?? new Set<string>();
    judges.add(eval_.judgeId);
    projectJudgedBy.set(eval_.projectId, judges);
  }

  const projectBordaScores = new Map<
    string,
    { name: string; totalBorda: number }
  >();

  for (const [judgeId, evals] of judgeMap) {
    const sorted = evals.filter((e) => e.avg > 0).sort((a, b) => b.avg - a.avg);

    for (let i = 0; i < Math.min(sorted.length, 10); i++) {
      const bordaPoints = 10 - i;
      const projectId = sorted[i].projectId;
      const projectName = sorted[i].projectName ?? "Unknown";

      const existing = projectBordaScores.get(projectId) ?? {
        name: projectName,
        totalBorda: 0,
      };

      projectBordaScores.set(projectId, {
        name: projectName,
        totalBorda: existing.totalBorda + bordaPoints,
      });
    }
  }

  const rankings: RankingEntry[] = [];
  for (const [projectId, info] of projectBordaScores) {
    const numJudges = projectJudgedBy.get(projectId)?.size ?? 0;
    rankings.push({
      rank: 0,
      projectId,
      projectName: info.name,
      bordaScore: numJudges > 0 ? info.totalBorda / numJudges : 0,
      numJudges,
    });
  }

  rankings.sort((a, b) => b.bordaScore - a.bordaScore);

  return rankings.map((r, i) => ({ ...r, rank: i + 1 }));
}

export default async function ScoringsPage() {
  const [evaluationRows, judgeCounts] = await Promise.all([
    db
      .select({
        projectId: evaluations.projectId,
        projectName: projects.name,
        judgeId: evaluations.judgeId,
        judgeName: judges.name,
        scores: evaluations.scores,
      })
      .from(evaluations)
      .leftJoin(projects, eq(evaluations.projectId, projects.id))
      .leftJoin(judges, eq(evaluations.judgeId, judges.id))
      .orderBy(asc(evaluations.judgeId)),
    db
      .select({
        finalizedCount: sql<number>`count(*) filter (where ${judges.judgingPhase} = 'finalized')`,
        totalCount: sql<number>`count(*)`,
      })
      .from(judges),
  ]);

  const data: EvaluationWithJudge[] = evaluationRows.map((row) => ({
    projectId: row.projectId,
    projectName: row.projectName,
    judgeId: row.judgeId,
    judgeName: row.judgeName,
    score1: row.scores?.[0] ?? null,
    score2: row.scores?.[1] ?? null,
    score3: row.scores?.[2] ?? null,
  }));

  const rankings = calculateRankings(data).slice(0, 15);

  const projectMap = data.reduce(
    (result, evaluation) => {
      if (!result[evaluation.projectId]) {
        result[evaluation.projectId] = {
          id: evaluation.projectId,
          name: evaluation.projectName ?? "Unknown",
          evaluations: [],
        };
      }
      result[evaluation.projectId].evaluations.push(evaluation);
      return result;
    },
    {} as Record<string, ProjectWithEvaluations>,
  );

  const sortedProjects: ProjectWithEvaluations[] = Object.values(
    projectMap,
  ).sort((a, b) => a.name.localeCompare(b.name));

  const finalizedCount = judgeCounts[0]?.finalizedCount ?? 0;
  const totalJudges = judgeCounts[0]?.totalCount ?? 0;

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Scorings</h1>
        <p className="text-sm text-muted-foreground">
          View all project scores by judge
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Judging Status</span>
            <span className="text-lg font-medium text-muted-foreground">
              {finalizedCount}/{totalJudges} judges has finalized
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rankings (Top 15)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-sm font-medium">
                  <th className="px-4 py-2 w-12">Rank</th>
                  <th className="px-4 py-2">Project</th>
                  <th className="px-4 py-2 text-right">Avg Borda Score</th>
                  <th className="px-4 py-2 text-right">Judges</th>
                </tr>
              </thead>
              <tbody>
                {rankings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-4 text-center text-muted-foreground"
                    >
                      No rankings available
                    </td>
                  </tr>
                ) : (
                  rankings.map((r) => (
                    <tr key={r.projectId} className="border-b">
                      <td className="px-4 py-2 font-medium">{r.rank}</td>
                      <td className="px-4 py-2">{r.projectName}</td>
                      <td className="px-4 py-2 text-right">
                        {r.bordaScore.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right text-muted-foreground">
                        {r.numJudges}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Scores ({sortedProjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoringsTable projects={sortedProjects} />
        </CardContent>
      </Card>
    </main>
  );
}
