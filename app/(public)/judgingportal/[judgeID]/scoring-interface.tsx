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
  const [sortBy, setSortBy] = useState<"location" | "unranked">("location");

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
    const sortedLocations: number[] = [];

    evaluations.forEach((evaluation) => {
      const locationNum = parseInt(evaluation.projectLocation, 10);
      if (isNaN(locationNum)) return;
      
      const groupKey = Math.floor((locationNum - 1) / 10);
      const groupLabel = `Locations ${groupKey * 10 + 1}-${(groupKey + 1) * 10}`;
      
      if (!groups[groupLabel]) {
        groups[groupLabel] = [];
        sortedLocations.push(groupKey);
      }
      groups[groupLabel].push(evaluation);
    });

    sortedLocations.sort((a, b) => a - b);
    
    return sortedLocations.map((key) => {
      const groupLabel = `Locations ${key * 10 + 1}-${(key + 1) * 10}`;
      return {
        label: groupLabel,
        evaluations: groups[groupLabel].sort((a, b) => 
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

  return (
    <>
      <div className="mb-4 flex items-center justify-end">
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as "location" | "unranked")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="location">By Location</SelectItem>
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
