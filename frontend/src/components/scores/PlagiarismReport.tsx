"use client";

import { useState } from "react";
import { PlagiarismResult } from "@/types/api";
import { ExternalLink, ShieldCheck, AlertCircle, RefreshCw, Quote } from "lucide-react";
import { CitationModal } from "./CitationModal";
import { useToolStore } from "@/store/toolStore";
import { useHumanize } from "@/hooks/useHumanize";

export function PlagiarismReport({
  result,
  onRewriteFlagged,
}: {
  result: PlagiarismResult | null;
  onRewriteFlagged?: () => void;
}) {
  const [citationModalOpen, setCitationModalOpen] = useState(false);
  const [activeSourceUrl, setActiveSourceUrl] = useState("");
  const { isHumanizing } = useToolStore();
  const { startHumanize } = useHumanize();

  if (!result) {
    return (
      <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-500">
        <p className="text-sm font-medium">No plagiarism scan run yet.</p>
        <p className="text-xs text-neutral-400 mt-1">
          Click &ldquo;Check Plagiarism&rdquo; on the output box to perform a deep web & journal similarity scan.
        </p>
      </div>
    );
  }

  const isHigh = result.similarity_score > 15;

  const handleOpenCitation = (url: string) => {
    setActiveSourceUrl(url);
    setCitationModalOpen(true);
  };

  const handleRewrite = () => {
    if (onRewriteFlagged) {
      onRewriteFlagged();
    } else {
      startHumanize();
    }
  };

  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl ${
              isHigh
                ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            }`}
          >
            {result.similarity_score}%
          </div>
          <div>
            <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              {isHigh ? (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-500" /> Potential Matches Detected
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Clean Originality Report
                </>
              )}
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              {result.sources.length === 0
                ? "No matching external academic papers or web sources found."
                : `Matched across ${result.sources.length} online sources or publications.`}
            </p>
          </div>
        </div>

        {isHigh && (
          <button
            type="button"
            onClick={handleRewrite}
            disabled={isHumanizing}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isHumanizing ? "animate-spin" : ""}`} />
            Rewrite Flagged Parts
          </button>
        )}
      </div>

      {/* Flagged Segments */}
      {result.flagged_segments && result.flagged_segments.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
          <h5 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2">
            Flagged Text Segments
          </h5>
          <div className="space-y-2">
            {result.flagged_segments.map((segment, idx) => (
              <p
                key={idx}
                className="text-xs p-2.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-amber-200 dark:border-amber-800 text-neutral-800 dark:text-neutral-200 font-mono"
              >
                &ldquo;{segment}&rdquo;
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Matched Sources List */}
      {result.sources.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Source Matches ({result.sources.length})
          </h5>
          <div className="space-y-2">
            {result.sources.map((src, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      {src.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      {src.match_percentage}% match
                    </span>
                  </div>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-sm"
                  >
                    {src.url} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenCitation(src.url)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold text-[11px] transition-colors"
                  >
                    <Quote className="w-3 h-3 text-indigo-500" /> Cite Source
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Citation Generator Modal */}
      <CitationModal
        isOpen={citationModalOpen}
        onClose={() => setCitationModalOpen(false)}
        sourceUrl={activeSourceUrl}
      />
    </div>
  );
}
