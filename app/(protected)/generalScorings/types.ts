export interface EvaluationWithJudge {
  projectId: string;
  projectName: string | null;
  judgeId: string;
  judgeName: string | null;
  score1: number | null;
  score2: number | null;
  score3: number | null;
}

export interface ProjectWithEvaluations {
  id: string;
  name: string;
  evaluations: EvaluationWithJudge[];
}
