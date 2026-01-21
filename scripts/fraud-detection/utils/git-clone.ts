import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import simpleGit, { type SimpleGit } from "simple-git";
import type { CommitInfo, GitAnalysis } from "../types";

export async function analyzeRepository(
  repoUrl: string,
  hackathonStart: Date,
  hackathonEnd: Date,
  verbose = false,
): Promise<GitAnalysis> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "fraud-check-"));

  const result: GitAnalysis = {
    repoUrl,
    repoExists: false,
    isPrivate: false,
    isForked: false,
    forkParent: null,
    repoCreatedAt: null,
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
    error: null,
  };

  try {
    if (verbose) {
      console.log(`    Cloning ${repoUrl}...`);
    }

    const git: SimpleGit = simpleGit();
    await git.clone(repoUrl, tempDir, ["--bare"]);

    const repoGit = simpleGit(tempDir);
    result.repoExists = true;

    const logResult = await repoGit.raw([
      "log",
      "--all",
      "--format=%H|%an|%ae|%aI|%cI|%s",
      "--numstat",
    ]);

    const commits = parseGitLog(logResult);
    result.commits = commits;
    result.totalCommits = commits.length;

    if (commits.length > 0) {
      const sortedByDate = [...commits].sort(
        (a, b) => a.authorDate.getTime() - b.authorDate.getTime(),
      );

      result.firstCommitDate = sortedByDate[0].authorDate;
      result.lastCommitDate = sortedByDate[sortedByDate.length - 1].authorDate;

      for (const commit of commits) {
        if (commit.authorDate < hackathonStart) {
          result.commitsBeforeHackathon++;
        } else if (commit.authorDate <= hackathonEnd) {
          result.commitsDuringHackathon++;
        } else {
          result.commitsAfterHackathon++;
        }

        result.totalLinesAdded += commit.additions;
        result.totalLinesDeleted += commit.deletions;

        if (commit.additions > result.largestCommitAdditions) {
          result.largestCommitAdditions = commit.additions;
          result.largestCommitMessage = commit.message;
        }

        const timeDiff = Math.abs(
          commit.authorDate.getTime() - commit.committerDate.getTime(),
        );
        if (timeDiff > 60 * 60 * 1000) {
          result.authorDateMismatches++;
        }
      }

      const authorEmails = new Set(
        commits.map((c) => c.authorEmail.toLowerCase()),
      );
      result.uniqueAuthors = Array.from(authorEmails);
    }

    return result;
  } catch (error) {
    result.error =
      error instanceof Error ? error.message : "Unknown error during clone";

    if (
      result.error.includes("Authentication failed") ||
      result.error.includes("could not read Username") ||
      result.error.includes("Repository not found")
    ) {
      result.isPrivate = true;
      result.error = "Repository is private or does not exist";
    }

    return result;
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}

function parseGitLog(logOutput: string): CommitInfo[] {
  const commits: CommitInfo[] = [];
  const lines = logOutput.split("\n");
  let currentCommit: Partial<CommitInfo> | null = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    if (line.includes("|") && line.match(/^[a-f0-9]{40}\|/)) {
      if (currentCommit?.sha) {
        commits.push(currentCommit as CommitInfo);
      }

      const parts = line.split("|");
      if (parts.length >= 6) {
        currentCommit = {
          sha: parts[0],
          authorName: parts[1],
          authorEmail: parts[2],
          authorDate: new Date(parts[3]),
          committerDate: new Date(parts[4]),
          message: parts.slice(5).join("|"),
          additions: 0,
          deletions: 0,
          filesChanged: 0,
          files: [],
        };
      }
    } else if (currentCommit) {
      const numstatMatch = line.match(/^(\d+|-)\s+(\d+|-)\s+(.+)$/);
      if (numstatMatch) {
        const additions =
          numstatMatch[1] === "-" ? 0 : Number.parseInt(numstatMatch[1], 10);
        const deletions =
          numstatMatch[2] === "-" ? 0 : Number.parseInt(numstatMatch[2], 10);
        const filename = numstatMatch[3];
        currentCommit.additions = (currentCommit.additions || 0) + additions;
        currentCommit.deletions = (currentCommit.deletions || 0) + deletions;
        currentCommit.filesChanged = (currentCommit.filesChanged || 0) + 1;
        if (currentCommit.files) {
          currentCommit.files.push(filename);
        }
      }
    }
  }

  if (currentCommit?.sha) {
    commits.push(currentCommit as CommitInfo);
  }

  return commits;
}

export async function checkRepoAccessible(repoUrl: string): Promise<boolean> {
  try {
    const git = simpleGit();
    await git.listRemote([repoUrl]);
    return true;
  } catch {
    return false;
  }
}
