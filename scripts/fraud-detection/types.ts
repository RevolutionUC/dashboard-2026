export interface CSVRow {
  "Opt-In Prize": string;
  "Project Title": string;
  "Submission Url": string;
  "Project Status": string;
  "Judging Status": string;
  "Highest Step Completed": string;
  "Project Created At": string;
  "About The Project": string;
  '"Try it out" Links': string;
  "Video Demo Link": string;
  "Built With": string;
  "Submitter First Name": string;
  "Submitter Last Name": string;
  "Submitter Email": string;
  "Team Colleges/Universities": string;
  "Additional Team Member Count": string;
  [key: string]: string;
}

export interface TeamMember {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Project {
  title: string;
  submissionUrl: string;
  projectStatus: string;
  createdAt: Date;
  description: string;
  builtWith: string[];
  videoUrl: string | null;
  tryItOutLinks: string[];
  submitter: TeamMember;
  teamMembers: TeamMember[];
  teamSize: number;
  githubUrls: string[];
  optInPrizes: string[];
}

export interface CommitInfo {
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authorDate: Date;
  committerDate: Date;
  additions: number;
  deletions: number;
  filesChanged: number;
  files: string[];
}

export interface GitAnalysis {
  repoUrl: string;
  repoExists: boolean;
  isPrivate: boolean;
  isForked: boolean;
  forkParent: string | null;
  repoCreatedAt: Date | null;
  totalCommits: number;
  firstCommitDate: Date | null;
  lastCommitDate: Date | null;
  commitsBeforeHackathon: number;
  commitsDuringHackathon: number;
  commitsAfterHackathon: number;
  totalLinesAdded: number;
  totalLinesDeleted: number;
  largestCommitAdditions: number;
  largestCommitMessage: string;
  uniqueAuthors: string[];
  authorDateMismatches: number;
  commits: CommitInfo[];
  error: string | null;
}

export type FraudSeverity = "critical" | "high" | "medium" | "low" | "info";

export type FraudCategory =
  | "pre-hackathon-commits"
  | "git-history-manipulation"
  | "forked-repo"
  | "code-dump"
  | "deadline-commits-only"
  | "private-repo"
  | "no-commits-during-hackathon"
  | "suspicious-messages"
  | "suspicious-files"
  | "mismatched-authors"
  | "no-repo"
  | "boundary-commits";

export interface FraudFlag {
  severity: FraudSeverity;
  category: FraudCategory;
  title: string;
  description: string;
  evidence: string[];
  scoreImpact: number;
}

export type RiskLevel = "DISQUALIFY" | "REVIEW" | "WATCH" | "PASS";

export interface ProjectAnalysis {
  project: Project;
  gitAnalyses: GitAnalysis[];
  flags: FraudFlag[];
  fraudScore: number;
  riskLevel: RiskLevel;
}

export interface FraudReport {
  generatedAt: Date;
  hackathonStart: Date;
  hackathonEnd: Date;
  totalProjects: number;
  projectsWithGitHub: number;
  projectsAnalyzed: number;
  disqualifyCount: number;
  reviewCount: number;
  watchCount: number;
  passCount: number;
  flagsByCategory: Record<FraudCategory, number>;
  projects: ProjectAnalysis[];
}

export interface CLIOptions {
  csv: string;
  start: string;
  end: string;
  output?: string;
  quick?: boolean;
  verbose?: boolean;
  repo?: string;
  githubToken?: string;
}
