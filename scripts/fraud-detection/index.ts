#!/usr/bin/env tsx

import { parseCSV } from "./csv-parser";
import { analyzeProject, sortByRisk } from "./checks";
import { analyzeRepository } from "./utils/git-clone";
import { getRepoInfo, RateLimiter } from "./utils/github-api";
import { printReport, printProgress, printError, printSuccess } from "./reporters/console";
import { saveJsonReport, saveCsvSummary } from "./reporters/json";
import type { CLIOptions, FraudCategory, FraudReport, GitAnalysis, ProjectAnalysis } from "./types";

const DEFAULT_START = "2025-03-01T12:00:00-05:00";
const DEFAULT_END = "2025-03-02T12:30:00-05:00";

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    csv: "",
    start: DEFAULT_START,
    end: DEFAULT_END,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case "--csv":
        options.csv = next || "";
        i++;
        break;
      case "--start":
        options.start = next || DEFAULT_START;
        i++;
        break;
      case "--end":
        options.end = next || DEFAULT_END;
        i++;
        break;
      case "--output":
        options.output = next;
        i++;
        break;
      case "--verbose":
        options.verbose = true;
        break;
      case "--quick":
        options.quick = true;
        break;
      case "--github-token":
        options.githubToken = next;
        i++;
        break;
      case "--help":
        printUsage();
        process.exit(0);
    }
  }

  if (!options.csv) {
    printError("Missing required --csv argument");
    printUsage();
    process.exit(1);
  }

  return options;
}

function printUsage(): void {
  console.log(`
Hackathon Fraud Detection Script

Usage:
  pnpm tsx scripts/fraud-detection/index.ts --csv <path> [options]

Required:
  --csv <path>         Path to DevPost CSV export

Options:
  --start <date>       Hackathon start date (ISO format)
                       Default: ${DEFAULT_START}
  --end <date>         Hackathon end date (ISO format)
                       Default: ${DEFAULT_END}
  --output <path>      Output JSON report path
  --verbose            Show detailed progress
  --quick              Skip git cloning (faster, less accurate)
  --github-token <t>   GitHub API token for higher rate limits
  --help               Show this help message
`);
}

async function main(): Promise<void> {
  const options = parseArgs();

  const hackathonStart = new Date(options.start);
  const hackathonEnd = new Date(options.end);

  if (Number.isNaN(hackathonStart.getTime()) || Number.isNaN(hackathonEnd.getTime())) {
    printError("Invalid date format. Use ISO format (e.g., 2025-03-01T12:00:00-05:00)");
    process.exit(1);
  }

  console.log();
  console.log("=".repeat(70));
  console.log("  Hackathon Fraud Detection");
  console.log("=".repeat(70));
  console.log();
  console.log(`CSV File: ${options.csv}`);
  console.log(`Hackathon Start: ${hackathonStart.toISOString()}`);
  console.log(`Hackathon End: ${hackathonEnd.toISOString()}`);
  console.log(`Mode: ${options.quick ? "Quick (API only)" : "Full (with git clone)"}`);
  console.log();

  printProgress("Parsing CSV file...");
  const projects = parseCSV(options.csv);
  printSuccess(`Found ${projects.length} unique projects`);

  const projectsWithGitHub = projects.filter((p) => p.githubUrls.length > 0);
  printSuccess(`${projectsWithGitHub.length} projects have GitHub repos`);
  console.log();

  const rateLimiter = new RateLimiter(2);
  const projectAnalyses: ProjectAnalysis[] = [];

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const progress = `[${i + 1}/${projects.length}]`;

    if (options.verbose) {
      console.log(`${progress} Analyzing: ${project.title}`);
    } else {
      process.stdout.write(`\r${progress} Analyzing projects...`);
    }

    const gitAnalyses: GitAnalysis[] = [];

    for (const repoUrl of project.githubUrls) {
      await rateLimiter.wait();

      if (options.quick) {
        const repoInfo = await getRepoInfo(repoUrl, options.githubToken);
        gitAnalyses.push({
          repoUrl,
          repoExists: repoInfo.exists,
          isPrivate: repoInfo.isPrivate,
          isForked: repoInfo.isForked,
          forkParent: repoInfo.forkParent,
          repoCreatedAt: repoInfo.createdAt,
          totalCommits: 0,
          firstCommitDate: null,
          lastCommitDate: null,
          commitsBeforeHackathon: 0,
          commitsDuringHackathon: 0,
          commitsAfterHackathon: 0,
          totalLinesAdded: 0,
          totalLinesDeleted: 0,
          largestCommitAdditions: 0,
          largestCommitMessage: "",
          uniqueAuthors: [],
          authorDateMismatches: 0,
          commits: [],
          error: repoInfo.error,
        });
      } else {
        const analysis = await analyzeRepository(
          repoUrl,
          hackathonStart,
          hackathonEnd,
          options.verbose,
        );
        gitAnalyses.push(analysis);
      }
    }

    const projectAnalysis = analyzeProject(project, gitAnalyses, hackathonStart, hackathonEnd);
    projectAnalyses.push(projectAnalysis);
  }

  console.log();

  const sortedAnalyses = sortByRisk(projectAnalyses);

  const report: FraudReport = {
    generatedAt: new Date(),
    hackathonStart,
    hackathonEnd,
    totalProjects: projects.length,
    projectsWithGitHub: projectsWithGitHub.length,
    projectsAnalyzed: projectAnalyses.filter((p) => p.gitAnalyses.some((g) => g.repoExists)).length,
    disqualifyCount: sortedAnalyses.filter((p) => p.riskLevel === "DISQUALIFY").length,
    reviewCount: sortedAnalyses.filter((p) => p.riskLevel === "REVIEW").length,
    watchCount: sortedAnalyses.filter((p) => p.riskLevel === "WATCH").length,
    passCount: sortedAnalyses.filter((p) => p.riskLevel === "PASS").length,
    flagsByCategory: calculateFlagsByCategory(sortedAnalyses),
    projects: sortedAnalyses,
  };

  printReport(report);

  if (options.output) {
    saveJsonReport(report, options.output);
    printSuccess(`JSON report saved to: ${options.output}`);

    const csvPath = options.output.replace(/\.json$/, ".csv");
    saveCsvSummary(report, csvPath);
    printSuccess(`CSV summary saved to: ${csvPath}`);
  }
}

function calculateFlagsByCategory(analyses: ProjectAnalysis[]): Record<FraudCategory, number> {
  const counts: Record<FraudCategory, number> = {
    "pre-hackathon-commits": 0,
    "git-history-manipulation": 0,
    "forked-repo": 0,
    "code-dump": 0,
    "deadline-commits-only": 0,
    "private-repo": 0,
    "no-commits-during-hackathon": 0,
    "suspicious-messages": 0,
    "suspicious-files": 0,
    "mismatched-authors": 0,
    "no-repo": 0,
    "boundary-commits": 0,
  };

  for (const analysis of analyses) {
    for (const flag of analysis.flags) {
      counts[flag.category]++;
    }
  }

  return counts;
}

main().catch((error) => {
  printError(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
