import { parse } from "csv-parse/sync";
import * as fs from "node:fs";
import type { CSVRow, Project, TeamMember } from "./types";

export function parseCSV(filePath: string): Project[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const records: CSVRow[] = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
  });

  const projectMap = new Map<string, Project>();

  for (const row of records) {
    const url = row["Submission Url"];
    if (!url?.includes("devpost.com")) continue;

    if (projectMap.has(url)) {
      const existing = projectMap.get(url)!;
      const prize = row["Opt-In Prize"];
      if (prize && !existing.optInPrizes.includes(prize)) {
        existing.optInPrizes.push(prize);
      }
      continue;
    }

    const project = transformRow(row);
    if (project) projectMap.set(url, project);
  }

  return Array.from(projectMap.values());
}

function transformRow(row: CSVRow): Project | null {
  const title = row["Project Title"];
  const submissionUrl = row["Submission Url"];
  if (!title || !submissionUrl) return null;

  const tryItOutLinks = row['"Try it out" Links'] || "";
  const members = extractTeamMembers(row);

  return {
    title,
    submissionUrl,
    projectStatus: row["Project Status"] || "",
    createdAt: parseTimestamp(row["Project Created At"]),
    description: row["About The Project"] || "",
    builtWith: parseCommaList(row["Built With"]),
    videoUrl: row["Video Demo Link"] || null,
    tryItOutLinks: parseCommaList(tryItOutLinks),
    submitter: {
      firstName: row["Submitter First Name"] || "",
      lastName: row["Submitter Last Name"] || "",
      email: (row["Submitter Email"] || "").toLowerCase().trim(),
    },
    teamMembers: members,
    teamSize: 1 + members.length,
    githubUrls: extractGitHubUrls(tryItOutLinks),
    optInPrizes: row["Opt-In Prize"] ? [row["Opt-In Prize"]] : [],
  };
}

export function extractGitHubUrls(links: string): string[] {
  if (!links) return [];

  const urls: string[] = [];
  const regex = /https?:\/\/github\.com\/([^/\s,\])]+)\/([^/\s,\])#]+)/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(links)) !== null) {
    const owner = match[1];
    const repo = match[2]
      .replace(/\.git$/, "")
      .split("/")[0]
      .split("#")[0];
    const cleanUrl = `https://github.com/${owner}/${repo}`;
    if (!urls.includes(cleanUrl)) urls.push(cleanUrl);
  }

  return urls;
}

function extractTeamMembers(row: CSVRow): TeamMember[] {
  const members: TeamMember[] = [];
  const count = Number.parseInt(row["Additional Team Member Count"] || "0", 10);

  for (let i = 1; i <= Math.max(count, 10); i++) {
    const firstName = row[`Team Member ${i} First Name`];
    const lastName = row[`Team Member ${i} Last Name`];
    const email = row[`Team Member ${i} Email`];

    if (firstName && lastName) {
      members.push({
        firstName,
        lastName,
        email: (email || "").toLowerCase().trim(),
      });
    }
  }

  return members;
}

function parseTimestamp(ts: string): Date {
  if (!ts) return new Date();

  const parts = ts.split(" ");
  if (parts.length !== 2) return new Date();

  const [date, time] = parts;
  const [month, day, year] = date.split("/").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(Date.UTC(year, month - 1, day, hours + 5, minutes));
}

function parseCommaList(str: string): string[] {
  if (!str) return [];
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
