"use client";

import { Info, MapPin } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { saveCategoryRelevance, saveEvaluationScore } from "./actions";
import { NoteInput } from "./note-input";
import { ProjectScoreForm } from "./project-score-form";

interface Evaluation {
  projectId: string;
  categoryId: string;
  projectName: string;
  projectLocation: string;
  projectLocation2: string;
  projectUrl: string | null;
  projectStatus: string;
  scores: (number | null)[];
  categoryRelevance: number;
  note: string | null;
}

interface ScoringInterfaceProps {
  evaluations: Evaluation[];
  judgeId: string;
  categoryType: string;
  showNoteInput?: boolean;
}

export function ScoringInterface({
  evaluations,
  judgeId,
  categoryType,
  showNoteInput = false,
}: ScoringInterfaceProps) {
  const isCategoricalJudge = categoryType === 'Inhouse' || categoryType === 'Sponsor'

  const [saving, setSaving] = useState<string | null>(null);
  const [localScores, setLocalScores] = useState<
    Record<string, (number | null)[]>
  >(() => {
    const initial: Record<string, (number | null)[]> = {};
    evaluations.forEach((e) => {
      initial[e.projectId] = e.scores;
    });
    return initial;
  });

  const [localRelevance, setLocalRelevance] = useState<Record<string, number>>(
    () => {
      const initial: Record<string, number> = {};
      evaluations.forEach((e) => {
        initial[e.projectId] = e.categoryRelevance;
      });
      return initial;
    },
  );

  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [sortBy, setSortBy] = useState<"location-asc" | "location-desc" | "unranked">("location-asc");

  const isEvaluationScored = useCallback((evaluation: Evaluation) => {
    const scores = localScores[evaluation.projectId];
    const hasAllScores = scores?.every((s) => s !== null && s >= 1 && s <= 5);
    if (isCategoricalJudge && evaluation.categoryId !== 'general') {
      const hasRelevance = localRelevance[evaluation.projectId] >= 1 && localRelevance[evaluation.projectId] <= 5;
      return hasAllScores && hasRelevance;
    }
    return hasAllScores;
  }, [localScores, localRelevance, isCategoricalJudge]);

  const groupedEvaluations = useMemo(() => {
    if (sortBy === "unranked") {
      const unranked = evaluations.filter(e => !isEvaluationScored(e));
      const ranked = evaluations.filter(e => isEvaluationScored(e));
      return [
        { label: "Not Scored", evaluations: unranked },
        { label: "Scored", evaluations: ranked },
      ];
    }

    const groups: Record<string, Evaluation[]> = {};
    const sortedGroupKeys: string[] = [];

    evaluations.forEach((evaluation) => {
      const locationNum = parseInt(evaluation.projectLocation, 10);
      const location2 = isNaN(locationNum) 
        ? "Unknown" 
        : (evaluation.projectLocation2 || "Unknown");
      
      if (!groups[location2]) {
        groups[location2] = [];
        sortedGroupKeys.push(location2);
      }
      groups[location2].push(evaluation);
    });

    const isAsc = sortBy === "location-asc";
    sortedGroupKeys.sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      return isAsc ? a.localeCompare(b) : b.localeCompare(a);
    });
    
    return sortedGroupKeys.map((location2) => {
      const evals = groups[location2];
      const locationNums = evals
        .map(e => parseInt(e.projectLocation, 10))
        .filter(n => !isNaN(n))
        .sort((a, b) => a - b);
      
      const minLoc = locationNums[0];
      const maxLoc = locationNums[locationNums.length - 1];
      const label = location2 === "Unknown" || !minLoc || !maxLoc
        ? location2
        : `${location2} - ${minLoc}-${maxLoc}`;
      
      return {
        label,
        evaluations: evals.sort((a, b) => 
          parseInt(a.projectLocation, 10) - parseInt(b.projectLocation, 10)
        ),
      };
    });
  }, [evaluations, sortBy, isEvaluationScored]);

  const handleScoreChange = async (
    projectId: string,
    scoreIndex: number,
    score: number,
  ) => {
    setLocalScores((prev) => ({
      ...prev,
      [projectId]: prev[projectId]?.map((s, i) =>
        i === scoreIndex ? score : s,
      ) || [null, null, null],
    }));

    setSaving(`${projectId}-${scoreIndex}`);
    await saveEvaluationScore(judgeId, projectId, scoreIndex, score);
    setSaving(null);
  };

  const handleRelevanceChange = async (
    projectId: string,
    relevance: number,
  ) => {
    setLocalRelevance((prev) => ({
      ...prev,
      [projectId]: relevance,
    }));

    setSaving(`${projectId}-relevance`);
    await saveCategoryRelevance(judgeId, projectId, relevance);
    setSaving(null);
  };

  const isAllScored = useMemo(() => {
    return evaluations.every((evaluation) => {
      const scores = localScores[evaluation.projectId];
      const hasAllScores = scores?.every((s) => s !== null && s >= 1 && s <= 5);
      if (isCategoricalJudge && evaluation.categoryId !== 'general') {
        const hasRelevance = localRelevance[evaluation.projectId] >= 1 && localRelevance[evaluation.projectId] <= 5;
        return hasAllScores && hasRelevance;
      }
      return hasAllScores;
    });
  }, [evaluations, localScores, localRelevance, isCategoricalJudge]);

  const [rubricOpen, setRubricOpen] = useState(false);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Dialog open={rubricOpen} onOpenChange={setRubricOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Rubric
            </button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
            <DialogHeader>
              <DialogTitle>Judging Rubric</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold">Originality</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left font-medium">Stars</th>
                      <th className="pb-2 text-left font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 align-top">1 Star</td>
                      <td className="py-2">
                        <strong>Derivative</strong>: A direct clone of an existing app or a standard &quot;Hello World&quot; style tutorial project.
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 align-top">2 Stars</td>
                      <td className="py-2">
                        <strong>Slight Variation</strong>: A familiar idea with a very minor change, but no real surprise or innovation.
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 align-top">3 Stars</td>
                      <td className="py-2">
                        <strong>Solid Take</strong>: A fresh application of known concepts; a new combination of existing tools to solve a standard problem.
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 align-top">4 Stars</td>
                      <td className="py-2">
                        <strong>Distinctive</strong>: A clever solution that provides a very unique &quot;twist&quot; - <em>&quot;I could imagine that but haven&apos;t seen someone combine those systems before&quot;</em>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 align-top">5 Stars</td>
                      <td className="py-2">
                        <strong>Inspirational</strong>: A &quot;Wow!&quot; idea. A genuinely surprising and remarkably insightful solution that stands out; - <em>&quot;I&apos;ve never thought of that before.&quot;</em>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold">Execution</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left font-medium">Stars</th>
                      <th className="pb-2 text-left font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 align-top">1 Star</td>
                      <td className="py-2">
                        <strong>Non-functional</strong>: The project does not run; entirely based on mockups or a slide deck with no working logic.
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 align-top">2 Stars</td>
                      <td className="py-2">
                        <strong>Proof-of-Concept</strong>: Only the absolute barest functionality works; prone to crashing during the presentation.
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 align-top">3 Stars</td>
                      <td className="py-2">
                        <strong>Working Prototype</strong>: The core features work as intended, allowing for a successful end-to-end demo. Still has minor visual rough edges - still feels a bit unpolished.
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 align-top">4 Stars</td>
                      <td className="py-2">
                        <strong>Polished Demo</strong>: Very cohesive flow, impressive user interface, and clearly optimized to deliver a flawless pitch presentation. The user experience feels &quot;finished&quot; and professional. No &quot;hacks&quot; were visible.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 align-top">5 Stars</td>
                      <td className="py-2">
                        <strong>Seamless MVP</strong>: An exceptional hackathon build. The presented feature set works without a hitch and the design feels intentional and &quot;complete&quot; for the scope of the project - <em>&quot;I can&apos;t believe they built this in a weekend&quot;</em>.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold">Learning</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left font-medium">Stars</th>
                      <th className="pb-2 text-left font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 align-top">1 Star</td>
                      <td className="py-2">
                        <strong>Inside Comfort Zone</strong>: The team stuck to tools they already master; no significant evidence of new skills acquired.
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 align-top">2 Stars</td>
                      <td className="py-2">
                        <strong>Minor Attempt</strong>: Evidence of trying one or two small new libraries, but the implementation is very surface-level.
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 align-top">3 Stars</td>
                      <td className="py-2">
                        <strong>Growth Path</strong>: Clearly stepped outside their usual technology stack or solved a domain problem that was new to them.
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 align-top">4 Stars</td>
                      <td className="py-2">
                        <strong>Ambitious Challenge</strong>: Tackled a significant and unfamiliar technical or conceptual curve (e.g., implementing an AI model, new API integration, or unfamiliar backend structure).
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 align-top">5 Stars</td>
                      <td className="py-2">
                        <strong>Remarkable Leap</strong>: The team clearly mastered a complex or difficult technology during the hackathon and used it to create a functioning result that surprised the judges given the time constraint.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as "location-asc" | "location-desc" | "unranked")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="location-asc">By Location (A-Z)</SelectItem>
            <SelectItem value="location-desc">By Location (Z-A)</SelectItem>
            <SelectItem value="unranked">Unranked First</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-6">
        {groupedEvaluations.map((group) => (
          <div key={group.label}>
            <h2 className="mb-3 text-sm font-semibold text-slate-600">
              {group.label}
            </h2>
            <ul className="space-y-4">
              {group.evaluations.map((evaluation) => (
                <li key={evaluation.projectId}>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                          {evaluation.projectLocation}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {evaluation.projectName}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedEvaluation(evaluation)}
                          className="ml-auto rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          title="View project details"
                        >
                          <Info size={18} />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                        <MapPin size={16} />
                        <span>
                          {evaluation.projectLocation}
                          {evaluation.projectLocation2 ? ` - ${evaluation.projectLocation2}` : ""}
                        </span>
                        {evaluation.categoryId === 'general' && (
                          <span className="text-xs text-slate-400">(General-only)</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      {/* Category judges can also be assigned General-only projects to help speed up judging */}
                      {/* So we display the categoryRelevance scoring only if evaluation is not General */}
                      <ProjectScoreForm
                        projectId={evaluation.projectId}
                        shouldShowCategoryRelevanceScoring={isCategoricalJudge && evaluation.categoryId !== 'general'}
                        localScores={localScores}
                        localRelevance={localRelevance}
                        saving={saving}
                        onScoreChange={handleScoreChange}
                        onRelevanceChange={handleRelevanceChange}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {selectedEvaluation && (
        <Sheet
          open={!!selectedEvaluation}
          onOpenChange={() => setSelectedEvaluation(null)}
        >
          <SheetContent
            side="bottom"
            className="max-w-sm rounded-t-xl h-[90vh] p-4"
          >
            <SheetHeader className="mb-2">
              <SheetTitle>Project Details</SheetTitle>
            </SheetHeader>
            <div className="space-y-2">
              <p className="font-semibold text-slate-900">
                {selectedEvaluation.projectName}
              </p>
              <p className="flex items-center gap-1 text-sm text-slate-600">
                <MapPin size={14} />
                {selectedEvaluation.projectLocation}
                {selectedEvaluation.projectLocation2
                  ? ` - ${selectedEvaluation.projectLocation2}`
                  : ""}
              </p>
              {selectedEvaluation.projectUrl && (
                <a
                  href={selectedEvaluation.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:underline"
                >
                  {selectedEvaluation.projectUrl}
                </a>
              )}
            </div>
            <div className="mt-3 space-y-3 border-t pt-3">
              <p className="text-sm font-medium text-slate-700">Scores</p>
              <ProjectScoreForm
                projectId={selectedEvaluation.projectId}
                shouldShowCategoryRelevanceScoring={isCategoricalJudge && selectedEvaluation.categoryId !== 'general'}
                localScores={localScores}
                localRelevance={localRelevance}
                saving={saving}
                onScoreChange={handleScoreChange}
                onRelevanceChange={handleRelevanceChange}
              />
            </div>
            {showNoteInput && (
              <div className="mt-3 border-t pt-3">
                <NoteInput
                  projectId={selectedEvaluation.projectId}
                  initialNote={selectedEvaluation.note || ""}
                  judgeId={judgeId}
                />
              </div>
            )}
          </SheetContent>
        </Sheet>
      )}

      <div className="mt-6">
        <Link
          href={ isCategoricalJudge ? `/judgingportal/${judgeId}/ranking` : `/judgingportal/finished` }
          className={`block w-full rounded-lg py-3 text-center font-semibold transition-colors ${
            isAllScored
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
          onClick={(e) => {
            if (!isAllScored) {
              e.preventDefault();
            }
          }}
        >
          {isCategoricalJudge ? "Start ranking" : "Finish"}
        </Link>
        {!isAllScored && (
          <p className="mt-2 text-center text-xs text-slate-500">
            Score all projects to {isCategoricalJudge ? "enable ranking" : "finish"}
          </p>
        )}
      </div>
    </>
  );
}
