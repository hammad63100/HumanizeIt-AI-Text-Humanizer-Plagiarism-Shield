"use client";

import { ShieldCheck, AlertTriangle } from "lucide-react";

export function MeaningBadge({ score = 94 }: { score?: number }) {
  const isDriftWarning = score < 85;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
        isDriftWarning
          ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
          : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
      }`}
      title="Meaning-Lock compares high-dimensional semantic embeddings between original and rewritten text"
    >
      {isDriftWarning ? (
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
      ) : (
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      )}
      <div className="flex flex-col text-left">
        <span className="font-bold leading-tight">
          Meaning Kept: {Math.round(score)}%
        </span>
        {isDriftWarning && (
          <span className="text-[10px] font-normal opacity-90 leading-tight">
            Check factual accuracy (drift &gt; 15%)
          </span>
        )}
      </div>
    </div>
  );
}
