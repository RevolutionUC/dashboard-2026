"use client";

import { ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EvaluationWithJudge {
  projectId: string;
  projectName: string | null;
  judgeId: string;
  judgeName: string | null;
  score1: number | null;
  score2: number | null;
  score3: number | null;
}

interface ProjectWithEvaluations {
  id: string;
  name: string;
  evaluations: EvaluationWithJudge[];
}

type SortKey = "name" | "score1" | "score2" | "score3" | "avg";
type SortDir = "asc" | "desc";

function calculateAverages(evals: EvaluationWithJudge[]) {
  const valid = evals.filter(
    (e) => e.score1 !== null || e.score2 !== null || e.score3 !== null,
  );
  if (valid.length === 0) return { avg1: "-", avg2: "-", avg3: "-", avg: "-" };

  const avg1 =
    valid.reduce((sum, e) => sum + (e.score1 ?? 0), 0) / valid.length;
  const avg2 =
    valid.reduce((sum, e) => sum + (e.score2 ?? 0), 0) / valid.length;
  const avg3 =
    valid.reduce((sum, e) => sum + (e.score3 ?? 0), 0) / valid.length;
  const avg =
    valid.reduce(
      (sum, e) => sum + (e.score1 ?? 0) + (e.score2 ?? 0) + (e.score3 ?? 0),
      0,
    ) / valid.length;

  return {
    avg1: avg1.toFixed(1),
    avg2: avg2.toFixed(1),
    avg3: avg3.toFixed(1),
    avg: avg.toFixed(1),
  };
}

function getEvalAvg(evaluation: EvaluationWithJudge) {
  if (evaluation.score1 === null && evaluation.score2 === null && evaluation.score3 === null) {
    return 0;
  }
  return ((evaluation.score1 ?? 0) + (evaluation.score2 ?? 0) + (evaluation.score3 ?? 0)) / 3;
}

function SortableHeader({
  label,
  sortKey,
  currentSortKey,
  currentSortDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  currentSortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const isActive = currentSortKey === sortKey;
  return (
    <TableHead
      className="cursor-pointer select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          currentSortDir === "asc" ? (
            <ArrowUpDown className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
        )}
      </div>
    </TableHead>
  );
}

export function ScoringsTable({
  projects,
}: {
  projects: ProjectWithEvaluations[];
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleDetailExpand = (projectId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      const avgsA = calculateAverages(a.evaluations);
      const avgsB = calculateAverages(b.evaluations);

      switch (sortKey) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "score1":
          aVal = parseFloat(avgsA.avg1) || 0;
          bVal = parseFloat(avgsB.avg1) || 0;
          break;
        case "score2":
          aVal = parseFloat(avgsA.avg2) || 0;
          bVal = parseFloat(avgsB.avg2) || 0;
          break;
        case "score3":
          aVal = parseFloat(avgsA.avg3) || 0;
          bVal = parseFloat(avgsB.avg3) || 0;
          break;
        case "avg":
          aVal = parseFloat(avgsA.avg) || 0;
          bVal = parseFloat(avgsB.avg) || 0;
          break;
        default:
          aVal = a.name;
          bVal = b.name;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [projects, sortKey, sortDir]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <SortableHeader
              label="Project"
              sortKey="name"
              currentSortKey={sortKey}
              currentSortDir={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Score 1"
              sortKey="score1"
              currentSortKey={sortKey}
              currentSortDir={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Score 2"
              sortKey="score2"
              currentSortKey={sortKey}
              currentSortDir={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Score 3"
              sortKey="score3"
              currentSortKey={sortKey}
              currentSortDir={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Avg Score"
              sortKey="avg"
              currentSortKey={sortKey}
              currentSortDir={sortDir}
              onSort={handleSort}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProjects.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                No evaluations found
              </TableCell>
            </TableRow>
          ) : (
            sortedProjects.map((project) => {
              const isExpanded = expanded.has(project.id);
              const avgs = calculateAverages(project.evaluations);

              return (
                <React.Fragment key={project.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleDetailExpand(project.id)}
                  >
                    <TableCell>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {project.name}
                    </TableCell>
                    <TableCell>{avgs.avg1}</TableCell>
                    <TableCell>{avgs.avg2}</TableCell>
                    <TableCell>{avgs.avg3}</TableCell>
                    <TableCell className="font-medium">{avgs.avg}</TableCell>
                  </TableRow>
                  {isExpanded &&
                    project.evaluations.map((evaluation) => {
                      const avgScore = getEvalAvg(evaluation);
                      return (
                        <TableRow
                          key={`${project.id}-${evaluation.judgeId}`}
                          className="bg-muted/30"
                        >
                          <TableCell></TableCell>
                          <TableCell className="pl-8 text-muted-foreground">
                            {evaluation.judgeName ?? "Unknown Judge"}
                          </TableCell>
                          <TableCell>{evaluation.score1 ?? "-"}</TableCell>
                          <TableCell>{evaluation.score2 ?? "-"}</TableCell>
                          <TableCell>{evaluation.score3 ?? "-"}</TableCell>
                          <TableCell>
                            {avgScore > 0 ? avgScore.toFixed(1) : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
