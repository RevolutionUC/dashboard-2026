export interface EvaluationWithScore {
  projectId: string;
  projectName: string;
  projectLocation: string;
  projectLocation2: string;
  scores: number[];
  categoryRelevance: number;
  categoryBordaScore: number | null;
  calculatedScore: number;
}
