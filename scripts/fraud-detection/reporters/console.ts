import type { FraudReport, FraudSeverity, ProjectAnalysis, RiskLevel } from "../types";

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
};

function color(text: string, ...codes: string[]): string {
  return `${codes.join("")}${text}${colors.reset}`;
}

function severityColor(severity: FraudSeverity): string {
  switch (severity) {
    case "critical":
      return colors.red + colors.bold;
    case "high":
      return colors.red;
    case "medium":
      return colors.yellow;
    case "low":
      return colors.blue;
    case "info":
      return colors.dim;
  }
}

function riskColor(risk: RiskLevel): string {
  switch (risk) {
    case "DISQUALIFY":
      return colors.bgRed + colors.white + colors.bold;
    case "REVIEW":
      return colors.red + colors.bold;
    case "WATCH":
      return colors.yellow;
    case "PASS":
      return colors.green;
  }
}

function scoreColor(score: number): string {
  if (score >= 70) return colors.red + colors.bold;
  if (score >= 40) return colors.red;
  if (score >= 20) return colors.yellow;
  return colors.green;
}

export function printReport(report: FraudReport): void {
  const line = "=".repeat(70);

  console.log();
  console.log(color(line, colors.cyan));
  console.log(color("  HACKATHON FRAUD DETECTION REPORT", colors.cyan, colors.bold));
  console.log(color(line, colors.cyan));
  console.log();

  console.log(color("Report Info:", colors.bold));
  console.log(`  Generated: ${report.generatedAt.toISOString()}`);
  console.log(`  Hackathon Start: ${report.hackathonStart.toISOString()}`);
  console.log(`  Hackathon End: ${report.hackathonEnd.toISOString()}`);
  console.log();

  console.log(color("Summary:", colors.bold));
  console.log(`  Total Projects: ${report.totalProjects}`);
  console.log(`  Projects with GitHub: ${report.projectsWithGitHub}`);
  console.log(`  Projects Analyzed: ${report.projectsAnalyzed}`);
  console.log();

  console.log(color("Risk Breakdown:", colors.bold));
  console.log(
    `  ${color("DISQUALIFY", riskColor("DISQUALIFY"))} (score >= 70): ${report.disqualifyCount}`,
  );
  console.log(`  ${color("REVIEW", riskColor("REVIEW"))} (score 40-69): ${report.reviewCount}`);
  console.log(`  ${color("WATCH", riskColor("WATCH"))} (score 20-39): ${report.watchCount}`);
  console.log(`  ${color("PASS", riskColor("PASS"))} (score < 20): ${report.passCount}`);
  console.log();

  const categoriesWithFlags = Object.entries(report.flagsByCategory).filter(
    ([, count]) => count > 0,
  );
  if (categoriesWithFlags.length > 0) {
    console.log(color("Flags by Category:", colors.bold));
    for (const [category, count] of categoriesWithFlags) {
      console.log(`  ${category}: ${count}`);
    }
    console.log();
  }

  const disqualify = report.projects.filter((p) => p.riskLevel === "DISQUALIFY");
  if (disqualify.length > 0) {
    console.log();
    console.log(color(line, colors.red));
    console.log(color("  CRITICAL - DISQUALIFICATION REQUIRED", colors.red, colors.bold));
    console.log(color(line, colors.red));
    for (const analysis of disqualify) {
      printProjectAnalysis(analysis);
    }
  }

  const review = report.projects.filter((p) => p.riskLevel === "REVIEW");
  if (review.length > 0) {
    console.log();
    console.log(color(line, colors.yellow));
    console.log(color("  HIGH PRIORITY - MANUAL REVIEW REQUIRED", colors.yellow, colors.bold));
    console.log(color(line, colors.yellow));
    for (const analysis of review) {
      printProjectAnalysis(analysis);
    }
  }

  const watch = report.projects.filter((p) => p.riskLevel === "WATCH");
  if (watch.length > 0) {
    console.log();
    console.log(color(line, colors.blue));
    console.log(color("  WATCH LIST", colors.blue, colors.bold));
    console.log(color(line, colors.blue));
    for (const analysis of watch) {
      printProjectAnalysis(analysis, true);
    }
  }

  console.log();
  console.log(color(line, colors.cyan));
  console.log(
    color(
      `  ${report.disqualifyCount + report.reviewCount} projects require attention`,
      colors.bold,
    ),
  );
  console.log(color(line, colors.cyan));
  console.log();
}

function printProjectAnalysis(analysis: ProjectAnalysis, compact = false): void {
  const { project, flags, fraudScore, riskLevel, gitAnalyses } = analysis;

  console.log();
  console.log(
    color(`[SCORE: ${fraudScore}]`, scoreColor(fraudScore)),
    color(project.title, colors.bold),
  );
  console.log(`  ${color("Risk:", colors.dim)} ${color(riskLevel, riskColor(riskLevel))}`);
  console.log(`  ${color("DevPost:", colors.dim)} ${project.submissionUrl}`);

  if (project.githubUrls.length > 0) {
    console.log(`  ${color("GitHub:", colors.dim)} ${project.githubUrls.join(", ")}`);
  } else {
    console.log(`  ${color("GitHub:", colors.dim)} None provided`);
  }

  console.log(`  ${color("Team Size:", colors.dim)} ${project.teamSize}`);

  if (compact) {
    if (flags.length > 0) {
      const flagSummary = flags.map((f) => `[${f.severity.toUpperCase()}] ${f.title}`).join("; ");
      console.log(`  ${color("Flags:", colors.dim)} ${flagSummary}`);
    }
    return;
  }

  for (const flag of flags) {
    console.log();
    console.log(
      `  ${color(`[${flag.severity.toUpperCase()}]`, severityColor(flag.severity))} ${flag.title}`,
    );
    console.log(`    ${color(flag.description, colors.dim)}`);

    if (flag.evidence.length > 0) {
      console.log(`    ${color("Evidence:", colors.dim)}`);
      for (const evidence of flag.evidence) {
        console.log(`      - ${evidence}`);
      }
    }
  }

  for (const git of gitAnalyses) {
    if (!git.repoExists) continue;

    console.log();
    console.log(`  ${color("Git Analysis:", colors.dim)} ${git.repoUrl}`);
    console.log(`    Total commits: ${git.totalCommits}`);
    console.log(`    Before hackathon: ${git.commitsBeforeHackathon}`);
    console.log(`    During hackathon: ${git.commitsDuringHackathon}`);
    console.log(`    After hackathon: ${git.commitsAfterHackathon}`);
    console.log(`    Lines added: ${git.totalLinesAdded}`);
    console.log(`    Unique authors: ${git.uniqueAuthors.join(", ")}`);

    if (git.firstCommitDate) {
      console.log(`    First commit: ${git.firstCommitDate.toISOString()}`);
    }
  }
}

export function printProgress(message: string): void {
  console.log(color(`  ${message}`, colors.dim));
}

export function printError(message: string): void {
  console.error(color(`ERROR: ${message}`, colors.red));
}

export function printSuccess(message: string): void {
  console.log(color(`✓ ${message}`, colors.green));
}
