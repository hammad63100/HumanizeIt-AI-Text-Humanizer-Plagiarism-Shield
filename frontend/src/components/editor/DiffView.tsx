"use client";

import { useMemo } from "react";
import { diffWords } from "diff";

export function DiffView({
  originalText,
  rewrittenText,
}: {
  originalText: string;
  rewrittenText: string;
}) {
  const differences = useMemo(() => {
    if (!originalText || !rewrittenText) return [];
    return diffWords(originalText, rewrittenText);
  }, [originalText, rewrittenText]);

  if (!rewrittenText) {
    return (
      <div className="p-8 text-center text-neutral-400 text-sm">
        Run humanization to view word-by-word structural alterations.
      </div>
    );
  }

  return (
    <div className="p-5 font-sans text-sm md:text-base leading-relaxed overflow-y-auto max-h-[460px] rounded-2xl bg-neutral-50/50 dark:bg-neutral-950/40 border border-neutral-200/60 dark:border-neutral-800/60">
      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800 text-xs">
        <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-500 inline-block" />
          Added / Restructured
        </span>
        <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/20 border border-rose-500 inline-block line-through" />
          Removed Repetition
        </span>
      </div>

      <div className="space-y-1">
        {differences.map((part, index) => {
          if (part.added) {
            return (
              <span
                key={index}
                className="bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 px-1 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 font-medium"
              >
                {part.value}
              </span>
            );
          }
          if (part.removed) {
            return (
              <span
                key={index}
                className="bg-rose-100/90 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 line-through px-1 py-0.5 rounded border border-rose-300 dark:border-rose-800 opacity-70"
              >
                {part.value}
              </span>
            );
          }
          return (
            <span key={index} className="text-neutral-800 dark:text-neutral-200">
              {part.value}
            </span>
          );
        })}
      </div>
    </div>
  );
}
