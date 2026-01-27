import type { FraudFlag, GitAnalysis } from "../types";

const SUSPICIOUS_MESSAGE_PATTERNS = [
  /migrate/i,
  /port(ed)?\s+(from|over)/i,
  /copy\s+(from|over)/i,
  /re-?upload/i,
  /restore\s+backup/i,
  /from\s+old\s+repo/i,
  /transfer/i,
  /moved?\s+from/i,
];

export function runGitChecks(
  analysis: GitAnalysis,
  hackathonStart: Date,
  hackathonEnd: Date,
  registeredTeamSize: number,
): FraudFlag[] {
  const flags: FraudFlag[] = [];

  if (!analysis.repoExists) {
    if (analysis.isPrivate) {
      flags.push({
        severity: "high",
        category: "private-repo",
        title: "Private or inaccessible repository",
        description: "Cannot verify commit history - repository is private or does not exist",
        evidence: [analysis.error || "Repository not accessible"],
        scoreImpact: 30,
      });
    }
    return flags;
  }

  const preHackathonFlag = checkPreHackathonCommits(analysis, hackathonStart);
  if (preHackathonFlag) flags.push(preHackathonFlag);

  const manipulationFlag = checkHistoryManipulation(analysis);
  if (manipulationFlag) flags.push(manipulationFlag);

  const codeDumpFlag = checkCodeDump(analysis);
  if (codeDumpFlag) flags.push(codeDumpFlag);

  const deadlineFlag = checkDeadlineOnlyCommits(analysis, hackathonEnd);
  if (deadlineFlag) flags.push(deadlineFlag);

  const noCommitsFlag = checkNoCommitsDuringHackathon(analysis);
  if (noCommitsFlag) flags.push(noCommitsFlag);

  const suspiciousFilesFlag = checkSuspiciousFiles(analysis);
  if (suspiciousFilesFlag) flags.push(suspiciousFilesFlag);

  const messageFlags = checkSuspiciousMessages(analysis);
  flags.push(...messageFlags);

  const authorFlag = checkMismatchedAuthors(analysis, registeredTeamSize);
  if (authorFlag) flags.push(authorFlag);

  const boundaryFlag = checkBoundaryCommits(analysis, hackathonStart, hackathonEnd);
  if (boundaryFlag) flags.push(boundaryFlag);

  return flags;
}

function checkPreHackathonCommits(analysis: GitAnalysis, hackathonStart: Date): FraudFlag | null {
  if (!analysis.firstCommitDate) return null;

  const bufferStart = new Date(hackathonStart.getTime() - 60 * 60 * 1000);

  if (analysis.firstCommitDate < bufferStart) {
    const daysBefore = Math.floor(
      (hackathonStart.getTime() - analysis.firstCommitDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const preHackathonCommits = analysis.commits.filter((c) => c.authorDate < hackathonStart);
    const totalPreHackathonLines = preHackathonCommits.reduce((sum, c) => sum + c.additions, 0);

    if (totalPreHackathonLines < 100 && preHackathonCommits.length <= 2) {
      return {
        severity: "medium",
        category: "pre-hackathon-commits",
        title: "Repository initialized before hackathon",
        description: "Repo has early commits but with minimal code - may be setup only",
        evidence: [
          `First commit: ${analysis.firstCommitDate.toISOString()}`,
          `Hackathon start: ${hackathonStart.toISOString()}`,
          `Pre-hackathon commits: ${analysis.commitsBeforeHackathon}`,
          `Pre-hackathon lines added: ${totalPreHackathonLines}`,
        ],
        scoreImpact: 15,
      };
    }

    return {
      severity: "critical",
      category: "pre-hackathon-commits",
      title: "Substantial code committed before hackathon",
      description: `First commit was ${daysBefore} day(s) before hackathon started with significant code`,
      evidence: [
        `First commit: ${analysis.firstCommitDate.toISOString()}`,
        `Hackathon start: ${hackathonStart.toISOString()}`,
        `Commits before hackathon: ${analysis.commitsBeforeHackathon}`,
        `Lines added before hackathon: ${totalPreHackathonLines}`,
      ],
      scoreImpact: 100,
    };
  }

  return null;
}

function checkHistoryManipulation(analysis: GitAnalysis): FraudFlag | null {
  const mismatchThreshold = Math.max(1, analysis.totalCommits * 0.2);

  if (analysis.authorDateMismatches > mismatchThreshold) {
    return {
      severity: "critical",
      category: "git-history-manipulation",
      title: "Possible git history manipulation detected",
      description:
        "Multiple commits have significant differences between author and committer dates",
      evidence: [
        `Commits with date mismatches: ${analysis.authorDateMismatches}/${analysis.totalCommits}`,
        "This can indicate rebasing to change commit timestamps",
      ],
      scoreImpact: 100,
    };
  }

  return null;
}

function checkCodeDump(analysis: GitAnalysis): FraudFlag | null {
  if (analysis.totalCommits > 3) return null;

  if (analysis.largestCommitAdditions > 2000) {
    return {
      severity: "high",
      category: "code-dump",
      title: "Single code dump commit detected",
      description: `Only ${analysis.totalCommits} commit(s) with ${analysis.largestCommitAdditions} lines in largest commit`,
      evidence: [
        `Total commits: ${analysis.totalCommits}`,
        `Largest commit: ${analysis.largestCommitAdditions} lines added`,
        `Commit message: "${analysis.largestCommitMessage}"`,
        "Suggests code was developed elsewhere and uploaded",
      ],
      scoreImpact: 40,
    };
  }

  return null;
}

function checkDeadlineOnlyCommits(analysis: GitAnalysis, hackathonEnd: Date): FraudFlag | null {
  if (analysis.totalCommits < 3) return null;

  const finalHours = new Date(hackathonEnd.getTime() - 2 * 60 * 60 * 1000);
  const commitsInFinalHours = analysis.commits.filter(
    (c) => c.authorDate >= finalHours && c.authorDate <= hackathonEnd,
  ).length;

  const percentInFinal = (commitsInFinalHours / analysis.totalCommits) * 100;

  if (percentInFinal >= 90) {
    return {
      severity: "high",
      category: "deadline-commits-only",
      title: "All commits clustered at deadline",
      description: `${percentInFinal.toFixed(0)}% of commits made in final 2 hours`,
      evidence: [
        `Total commits: ${analysis.totalCommits}`,
        `Commits in final 2 hours: ${commitsInFinalHours}`,
        "No evidence of iterative development during hackathon",
      ],
      scoreImpact: 35,
    };
  }

  return null;
}

function checkNoCommitsDuringHackathon(analysis: GitAnalysis): FraudFlag | null {
  if (analysis.totalCommits === 0) return null;

  if (analysis.commitsDuringHackathon === 0 && analysis.commitsBeforeHackathon > 0) {
    return {
      severity: "high",
      category: "no-commits-during-hackathon",
      title: "No commits during hackathon window",
      description: "All commits are either before or after the hackathon period",
      evidence: [
        `Commits before hackathon: ${analysis.commitsBeforeHackathon}`,
        `Commits during hackathon: ${analysis.commitsDuringHackathon}`,
        `Commits after hackathon: ${analysis.commitsAfterHackathon}`,
      ],
      scoreImpact: 40,
    };
  }

  return null;
}

function checkSuspiciousFiles(analysis: GitAnalysis): FraudFlag | null {
  const suspiciousExtensions = [
    ".zip",
    ".rar",
    ".tar",
    ".tar.gz",
    ".tgz",
    ".7z",
    ".war",
    ".jar",
    ".ear",
    ".apk",
    ".ipa",
    ".exe",
    ".dll",
    ".so",
    ".dylib",
  ];

  const suspiciousFiles: string[] = [];

  for (const commit of analysis.commits) {
    for (const file of commit.files) {
      const lowerFile = file.toLowerCase();
      for (const ext of suspiciousExtensions) {
        if (lowerFile.endsWith(ext)) {
          suspiciousFiles.push(`${file} (commit ${commit.sha.slice(0, 7)})`);
          break;
        }
      }
    }
  }

  if (suspiciousFiles.length > 0) {
    return {
      severity: "medium",
      category: "suspicious-files",
      title: "Archive or binary files committed",
      description: `Found ${suspiciousFiles.length} suspicious file(s) that may contain pre-built code`,
      evidence: suspiciousFiles.slice(0, 10),
      scoreImpact: 25,
    };
  }

  return null;
}

function checkSuspiciousMessages(analysis: GitAnalysis): FraudFlag[] {
  const flags: FraudFlag[] = [];
  const suspiciousCommits: string[] = [];

  for (const commit of analysis.commits) {
    for (const pattern of SUSPICIOUS_MESSAGE_PATTERNS) {
      if (pattern.test(commit.message)) {
        suspiciousCommits.push(`"${commit.message}" (${commit.sha.slice(0, 7)})`);
        break;
      }
    }
  }

  if (suspiciousCommits.length > 0) {
    flags.push({
      severity: "medium",
      category: "suspicious-messages",
      title: "Suspicious commit messages found",
      description: "Commit messages suggest code may have been migrated from another project",
      evidence: suspiciousCommits,
      scoreImpact: 20,
    });
  }

  return flags;
}

function checkMismatchedAuthors(
  analysis: GitAnalysis,
  registeredTeamSize: number,
): FraudFlag | null {
  const humanAuthors = analysis.uniqueAuthors.filter((email) => {
    const lower = email.toLowerCase();
    return (
      !lower.includes("dependabot") && !lower.includes("github-actions") && !lower.includes("[bot]")
    );
  });

  const threshold = registeredTeamSize * 2;

  if (humanAuthors.length > threshold) {
    return {
      severity: "low",
      category: "mismatched-authors",
      title: "Multiple git authors detected",
      description: `${humanAuthors.length} unique git authors vs ${registeredTeamSize} registered members`,
      evidence: [
        `Registered team size: ${registeredTeamSize}`,
        `Git authors: ${humanAuthors.join(", ")}`,
        "May be email variations or external contributors",
      ],
      scoreImpact: 10,
    };
  }

  return null;
}

function checkBoundaryCommits(
  analysis: GitAnalysis,
  hackathonStart: Date,
  hackathonEnd: Date,
): FraudFlag | null {
  if (analysis.totalCommits < 5) return null;

  const startBuffer = new Date(hackathonStart.getTime() + 2 * 60 * 60 * 1000);
  const endBuffer = new Date(hackathonEnd.getTime() - 2 * 60 * 60 * 1000);

  const middleCommits = analysis.commits.filter(
    (c) => c.authorDate > startBuffer && c.authorDate < endBuffer,
  ).length;

  const middlePercent = (middleCommits / analysis.totalCommits) * 100;

  if (middlePercent < 20) {
    return {
      severity: "low",
      category: "boundary-commits",
      title: "Commits clustered at boundaries",
      description: `Only ${middlePercent.toFixed(0)}% of commits in middle of hackathon`,
      evidence: [
        `Total commits: ${analysis.totalCommits}`,
        `Commits in middle period: ${middleCommits}`,
        "Activity concentrated at start/end times",
      ],
      scoreImpact: 10,
    };
  }

  return null;
}
