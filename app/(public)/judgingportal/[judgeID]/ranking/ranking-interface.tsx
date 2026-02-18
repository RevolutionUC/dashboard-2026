"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { finalizeRankings, resetAllRankings, saveRanking } from "../actions";

interface EvaluationWithScore {
  projectId: string;
  projectName: string;
  projectLocation: string;
  projectLocation2: string;
  scores: number[];
  categoryRelevance: number;
  categoryBordaScore: number | null;
  calculatedScore: number;
}

interface RankingInterfaceProps {
  evaluations: EvaluationWithScore[];
  judgeId: string;
  categoryType: string;
}

const RANK_COLORS: Record<number, string> = {
  1: "border-yellow-400 bg-yellow-50",
  2: "border-gray-400 bg-gray-50",
  3: "border-amber-600 bg-amber-50",
  4: "border-blue-400 bg-blue-50",
  5: "border-purple-400 bg-purple-50",
};

const RANK_LABELS: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
  5: "5th",
};

export function RankingInterface({
  evaluations: initialEvaluations,
  judgeId,
  categoryType,
}: RankingInterfaceProps) {
  const isSponsor = categoryType === "Sponsor";

  // Normally, we requires 5 rankings, but in case there are less assigned projects than 5, we cap at assignedEvaluations.length
  const maxRank = Math.min(5, initialEvaluations.length);

  const [rankings, setRankings] = useState<Record<string, number | null>>(
    () => {
      const initial: Record<string, number | null> = {};
      initialEvaluations.forEach(({ projectId, categoryBordaScore }) => {
        const rank =
          categoryBordaScore !== null && categoryBordaScore > 0
            ? maxRank + 1 - categoryBordaScore
            : 0;

        initial[projectId] = rank >= 1 && rank <= maxRank ? rank : null;
      });

      return initial;
    },
  );

  const [saving, setSaving] = useState<string | null>(null);

  const { rankedProjects, unrankedProjects } = useMemo(() => {
    const ranked: Array<{ eval_: EvaluationWithScore; rank: number }> = [];
    const unranked: EvaluationWithScore[] = [];

    initialEvaluations.forEach((eval_) => {
      const rank = rankings[eval_.projectId];
      if (rank !== null) {
        ranked.push({ eval_, rank });
      } else {
        unranked.push(eval_);
      }
    });

    ranked.sort((a, b) => a.rank - b.rank);
    unranked.sort((a, b) => b.calculatedScore - a.calculatedScore);

    return { rankedProjects: ranked, unrankedProjects: unranked };
  }, [initialEvaluations, rankings]);

  const handleRankChange = async (
    projectId: string,
    newRank: number | null,
  ) => {
    const oldRank = rankings[projectId];

    if (newRank !== null) {
      const conflictingProjectId = Object.entries(rankings).find(
        ([id, r]) => r === newRank && id !== projectId,
      )?.[0];

      if (conflictingProjectId) {
        setRankings((prev) => ({
          ...prev,
          [conflictingProjectId]: oldRank,
        }));
      }
    }

    setRankings((prev) => ({
      ...prev,
      [projectId]: newRank,
    }));

    setSaving(projectId);
    const bordaScore = newRank !== null ? maxRank + 1 - newRank : 0;
    await saveRanking(judgeId, projectId, bordaScore);
    setSaving(null);
  };

  const availableRanks = useMemo(() => {
    const usedRanks = new Set(
      Object.values(rankings).filter((r): r is number => r !== null),
    );
    const allRanks = Array.from({ length: maxRank }, (_, i) => i + 1);
    return allRanks.filter((r) => !usedRanks.has(r));
  }, [rankings, maxRank]);

  const router = useRouter();

  const handleReset = async () => {
    setSaving("reset");
    await resetAllRankings(judgeId);
    const resetRankings: Record<string, number | null> = {};
    initialEvaluations.forEach((eval_) => {
      resetRankings[eval_.projectId] = null;
    });
    setRankings(resetRankings);
    setSaving(null);
  };

  const handleFinalize = async () => {
    if (!confirm("No backsies! Are you sure you want to finalize?")) return;
    setSaving("finalize");
    await finalizeRankings(judgeId);
    router.push(`/judgingportal/finished`);
  };

  return (
    <div className="space-y-6">
      <Link
        href={`../`}
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to scoring
      </Link>

      {rankedProjects.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Ranked Projects
            </h2>
            <button
              type="button"
              onClick={handleReset}
              disabled={saving === "reset"}
              className="rounded border border-red-300 bg-white px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving === "reset" ? "Resetting..." : "Reset ranking"}
            </button>
          </div>
          {rankedProjects.map(({ eval_, rank }) => (
            <div
              key={eval_.projectId}
              className={`rounded-lg border-2 p-4 ${RANK_COLORS[rank]}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700">
                      {RANK_LABELS[rank]}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {eval_.projectName}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-700">
                    Weighted Score: {eval_.calculatedScore.toFixed(1)}
                  </div>
                </div>
                <select
                  value={rank}
                  onChange={(e) =>
                    handleRankChange(
                      eval_.projectId,
                      Number(e.target.value) || null,
                    )
                  }
                  disabled={saving === eval_.projectId}
                  className="ml-2 rounded border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value={rank}>{RANK_LABELS[rank]}</option>
                  <option value="">Unranked</option>
                  {availableRanks.map((r) => (
                    <option key={r} value={r}>
                      {RANK_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {unrankedProjects.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Unranked Projects
          </h2>
          {unrankedProjects.map((eval_) => (
            <div
              key={eval_.projectId}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {eval_.projectName}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-700">
                    Weighted Score: {eval_.calculatedScore.toFixed(1)}
                  </div>
                  {isSponsor && (
                    <div className="mt-1 text-sm text-slate-500">
                      Relevance: {eval_.categoryRelevance}/5
                    </div>
                  )}
                </div>
                <select
                  value={rankings[eval_.projectId] || ""}
                  onChange={(e) =>
                    handleRankChange(
                      eval_.projectId,
                      Number(e.target.value) || null,
                    )
                  }
                  disabled={saving === eval_.projectId}
                  className="ml-2 rounded border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="">Select rank</option>
                  {availableRanks.map((r) => (
                    <option key={r} value={r}>
                      {RANK_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={handleFinalize}
          disabled={saving === "finalize" || availableRanks.length > 0}
          className={`w-full rounded-lg py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
            availableRanks.length === 0
              ? "bg-green-600 hover:bg-green-700"
              : "bg-slate-300"
          }`}
        >
          {saving === "finalize"
            ? "Finalizing..."
            : "Finalize ranking & scores"}
        </button>
        {availableRanks.length > 0 && (
          <p className="mt-2 text-center text-xs text-slate-500">
            Assign all {maxRank} ranking{maxRank > 1 ? "s" : ""} to finalize
          </p>
        )}
      </div>
    </div>
  );
}
