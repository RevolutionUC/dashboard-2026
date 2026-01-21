import * as fs from "node:fs";
import type { FraudReport } from "../types";

export function saveJsonReport(report: FraudReport, filePath: string): void {
  const json = JSON.stringify(report, null, 2);
  fs.writeFileSync(filePath, json, "utf-8");
}

export function saveCsvSummary(report: FraudReport, filePath: string): void {
  const headers = [
    "Project Title",
    "DevPost URL",
    "GitHub URL",
    "Risk Level",
    "Fraud Score",
    "Team Size",
    "Total Commits",
    "Commits Before Hackathon",
    "Commits During Hackathon",
    "Flag Count",
    "Critical Flags",
    "High Flags",
    "Flag Summary",
  ];

  const rows = report.projects.map((analysis) => {
    const { project, gitAnalyses, flags, fraudScore, riskLevel } = analysis;
    const git = gitAnalyses[0];

    const criticalCount = flags.filter((f) => f.severity === "critical").length;
    const highCount = flags.filter((f) => f.severity === "high").length;
    const flagSummary = flags.map((f) => f.title).join("; ");

    return [
      escapeCSV(project.title),
      project.submissionUrl,
      project.githubUrls[0] || "",
      riskLevel,
      fraudScore.toString(),
      project.teamSize.toString(),
      git?.totalCommits?.toString() || "N/A",
      git?.commitsBeforeHackathon?.toString() || "N/A",
      git?.commitsDuringHackathon?.toString() || "N/A",
      flags.length.toString(),
      criticalCount.toString(),
      highCount.toString(),
      escapeCSV(flagSummary),
    ];
  });

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  fs.writeFileSync(filePath, csv, "utf-8");
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
