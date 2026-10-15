"use client";

import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useToolStore } from "@/store/toolStore";
import { useHumanize } from "@/hooks/useHumanize";
import { countWords } from "@/lib/utils";
import { checkWordLimit } from "@/lib/limits";

export function HumanizeButton() {
  const { inputText, isHumanizing, jobProgress, userPlan } = useToolStore();
  const { startHumanize, error } = useHumanize();

  const words = countWords(inputText);
  const limit = checkWordLimit(words, userPlan);
  const isDisabled = words === 0 || limit.isOver || isHumanizing;

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={startHumanize}
        disabled={isDisabled}
        className={`w-full relative overflow-hidden py-3 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all ${
          isDisabled
            ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed shadow-none"
            : "bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 active:translate-y-0"
        }`}
      >
        {isHumanizing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Humanizing Text ({jobProgress}%)...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>Humanize Text</span>
          </>
        )}

        {/* Progress bar overlay while processing */}
        {isHumanizing && (
          <div
            className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-300 ease-out"
            style={{ width: `${jobProgress}%` }}
          />
        )}
      </button>
    </div>
  );
}
