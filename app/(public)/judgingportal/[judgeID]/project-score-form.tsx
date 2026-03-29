"use client";

import { Star } from "lucide-react";

const SCORE_LABELS = ["Originality", "Execution", "Learning"];

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
            ></Star>
          </button>
        ))}
        {disabled && (
          <span className="ml-2 text-xs text-slate-500">Saving...</span>
        )}
      </div>
    </div>
  );
}

interface ProjectScoreFormProps {
  projectId: string;
  shouldShowCategoryRelevanceScoring: boolean;
  localScores: Record<string, (number | null)[]>;
  localRelevance: Record<string, number>;
  saving: string | null;
  onScoreChange: (projectId: string, scoreIndex: number, score: number) => void;
  onRelevanceChange: (projectId: string, score: number) => void;
}

export function ProjectScoreForm({
  projectId,
  shouldShowCategoryRelevanceScoring,
  localScores,
  localRelevance,
  saving,
  onScoreChange,
  onRelevanceChange,
}: ProjectScoreFormProps) {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((scoreIndex) => (
        <StarRating
          key={scoreIndex}
          label={SCORE_LABELS[scoreIndex]}
          score={localScores[projectId]?.[scoreIndex] ?? null}
          onChange={(score) => onScoreChange(projectId, scoreIndex, score)}
          disabled={saving === `${projectId}-${scoreIndex}`}
        />
      ))}
      {shouldShowCategoryRelevanceScoring && (
        <StarRating
          label="Relevance"
          score={
            localRelevance[projectId] > 0
              ? localRelevance[projectId]
              : null
          }
          onChange={(score) => onRelevanceChange(projectId, score)}
          disabled={saving === `${projectId}-relevance`}
        />
      )}
    </div>
  );
}
