import type {
  FraudFlag,
  GitAnalysis,
  Project,
  ProjectAnalysis,
  RiskLevel,
} from "../types";
import { runGitChecks } from "./git-checks";

export function calculateFraudScore(flags: FraudFlag[]): number {
  let score = 0;
  for (const flag of flags) {
    score += flag.scoreImpact;
  }
  return Math.min(100, score);
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return "DISQUALIFY";
  if (score >= 40) return "REVIEW";
  if (score >= 20) return "WATCH";
  return "PASS";
}

export function analyzeProject(
  project: Project,
  gitAnalyses: GitAnalysis[],
  hackathonStart: Date,
  hackathonEnd: Date,
): ProjectAnalysis {
  const flags: FraudFlag[] = [];

  if (
    project.githubUrls.length === 0 &&
    project.description.length > 500 &&
    project.builtWith.length > 3
  ) {
    flags.push({
      severity: "medium",
      category: "no-repo",
      title: "No repository for complex project",
      description:
        "Project has detailed description and tech stack but no source code link",
      evidence: [
        `Description length: ${project.description.length} chars`,
        `Technologies: ${project.builtWith.join(", ")}`,
      ],
      scoreImpact: 25,
    });
  }

  for (const gitAnalysis of gitAnalyses) {
    const gitFlags = runGitChecks(
      gitAnalysis,
      hackathonStart,
      hackathonEnd,
      project.teamSize,
    );
    flags.push(...gitFlags);
  }

  const fraudScore = calculateFraudScore(flags);
  const riskLevel = getRiskLevel(fraudScore);

  return {
    project,
    gitAnalyses,
    flags,
    fraudScore,
    riskLevel,
  };
}

export function sortByRisk(analyses: ProjectAnalysis[]): ProjectAnalysis[] {
  return [...analyses].sort((a, b) => b.fraudScore - a.fraudScore);
}

export { runGitChecks };
