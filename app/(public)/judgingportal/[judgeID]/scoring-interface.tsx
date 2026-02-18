"use client";

import { MapPin, Star } from 'lucide-react';
import Link from "next/link";
import { useMemo, useState } from "react";
import { saveCategoryRelevance, saveEvaluationScore } from "./actions";

interface ProjectWithScores {
  id: string;
  name: string;
  location: string;
  location2: string;
  scores: (number | null)[];
  categoryRelevance: number;
}

interface ScoringInterfaceProps {
  projects: ProjectWithScores[];
  judgeId: string;
  categoryType: string;
}

function StarRating({
  score,
  onChange,
  disabled,
  label,
}: {
  score: number | null;
  onChange: (score: number) => void;
  disabled: boolean;
  label: string;
}) {
  const displayScore = score ?? 0;

  return (
    <div className="flex items-center">
      <span className="w-20 text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className="transition-transform disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
            aria-label={`Rate ${star} out of 5`}
          >
            <Star
              size={28}
              className={`${
                star <= displayScore
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
              strokeWidth={1}
            >
            </Star>
          </button>
        ))}
        {disabled && (
          <span className="ml-2 text-xs text-slate-500">Saving...</span>
        )}
      </div>
    </div>
  );
}

export function ScoringInterface({
  projects,
  judgeId,
  categoryType,
}: ScoringInterfaceProps) {
  const isSponsor = categoryType === "Sponsor";
  const isGeneral = categoryType === "General";

  const [saving, setSaving] = useState<string | null>(null);
  const [localScores, setLocalScores] = useState<
    Record<string, (number | null)[]>
  >(() => {
    const initial: Record<string, (number | null)[]> = {};
    projects.forEach((p) => {
      initial[p.id] = p.scores;
    });
    return initial;
  });

  const [localRelevance, setLocalRelevance] = useState<Record<string, number>>(
    () => {
      const initial: Record<string, number> = {};
      projects.forEach((p) => {
        initial[p.id] = p.categoryRelevance;
      });
      return initial;
    },
  );

  const handleScoreChange = async (
    projectId: string,
    scoreIndex: number,
    score: number,
  ) => {
    // Optimistically update local state
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
    // Optimistically update local state
    setLocalRelevance((prev) => ({
      ...prev,
      [projectId]: relevance,
    }));

    setSaving(`${projectId}-relevance`);
    await saveCategoryRelevance(judgeId, projectId, relevance);
    setSaving(null);
  };

  const allScored = useMemo(() => {
    return projects.every((project) => {
      const scores = localScores[project.id];
      const hasAllScores = scores?.every((s) => s !== null && s >= 1 && s <= 5);
      if (isSponsor) {
        const hasRelevance =
          localRelevance[project.id] >= 1 && localRelevance[project.id] <= 5;
        return hasAllScores && hasRelevance;
      }
      return hasAllScores;
    });
  }, [projects, localScores, localRelevance, isSponsor]);

  return (
    <>
      <ul className="space-y-4">
        {projects.map((project, index) => (
          <li key={project.id}>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {project.name}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin size={16} />
                  <span>
                    {project.location}
                    {project.location2 ? ` - ${project.location2}` : ""}
                  </span>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                {[0, 1, 2].map((scoreIndex) => (
                  <StarRating
                    key={scoreIndex}
                    label={`Score ${scoreIndex + 1}`}
                    score={localScores[project.id]?.[scoreIndex] ?? null}
                    onChange={(score) =>
                      handleScoreChange(project.id, scoreIndex, score)
                    }
                    disabled={saving === `${project.id}-${scoreIndex}`}
                  />
                ))}
                {isSponsor && (
                  <StarRating
                    label="Relevance"
                    score={
                      localRelevance[project.id] > 0
                        ? localRelevance[project.id]
                        : null
                    }
                    onChange={(score) =>
                      handleRelevanceChange(project.id, score)
                    }
                    disabled={saving === `${project.id}-relevance`}
                  />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Link
          href={isGeneral ? "/judgingportal/finished" : `/judgingportal/${judgeId}/rankings`}
          className={`block w-full rounded-lg py-3 text-center font-semibold transition-colors ${
            allScored
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
          onClick={(e) => {
            if (!allScored) {
              e.preventDefault();
            }
          }}
        >
          {isGeneral ? "Finish" : "Start ranking"}
        </Link>
        {!allScored && (
          <p className="mt-2 text-center text-xs text-slate-500">
            Score all projects to {isGeneral ? "finish" : "enable ranking"}
          </p>
        )}
      </div>
    </>
  );
}
