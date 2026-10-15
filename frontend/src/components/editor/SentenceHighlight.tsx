"use client";

import { useState } from "react";
import { SentenceScore } from "@/types/api";
import { Sparkles, Loader2, Check } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToolStore } from "@/store/toolStore";

export function SentenceHighlight({
  sentences,
  onSentenceUpdated,
}: {
  sentences: SentenceScore[];
  onSentenceUpdated?: (updatedIndex: number, newSentence: string) => void;
}) {
  const { tone } = useToolStore();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [successIdx, setSuccessIdx] = useState<number | null>(null);

  const handleRewriteSentence = async (idx: number, sentence: string) => {
    setIsRewriting(true);
    try {
      const res = await apiClient.rewriteSentence({
        sentence,
        tone,
      });

      if (onSentenceUpdated) {
        onSentenceUpdated(idx, res.rewritten_sentence);
      }
      setSuccessIdx(idx);
      setTimeout(() => setSuccessIdx(null), 2000);
      setSelectedIdx(null);
    } catch {
      // error handled
    } finally {
      setIsRewriting(false);
    }
  };

  if (!sentences || sentences.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-neutral-500 flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span>Click on any underlined sentence to rewrite it independently</span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-3 h-0.5 bg-amber-400" />
          <span>Elevated AI likelihood</span>
        </span>
      </div>

      <div className="space-y-2 leading-relaxed text-sm md:text-base">
        {sentences.map((item, index) => {
          const isSelected = selectedIdx === index;
          const isHighProb = item.ai_probability > 0.45;

          return (
            <span
              key={index}
              onClick={() => setSelectedIdx(isSelected ? null : index)}
              className={`inline relative cursor-pointer mr-1 rounded px-1 transition-all ${
                isSelected
                  ? "bg-indigo-100 dark:bg-indigo-950/70 ring-2 ring-indigo-500 text-neutral-900 dark:text-white"
                  : isHighProb
                  ? "border-b-2 border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-neutral-800 dark:text-neutral-200"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200"
              }`}
            >
              {item.sentence}{" "}
            </span>
          );
        })}
      </div>

      {/* Popover / Bar when a sentence is selected */}
      {selectedIdx !== null && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                Sentence #{selectedIdx + 1}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                {Math.round(sentences[selectedIdx].ai_probability * 100)}% AI likelihood
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 italic font-mono truncate max-w-md">
              &ldquo;{sentences[selectedIdx].sentence}&rdquo;
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedIdx(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleRewriteSentence(selectedIdx, sentences[selectedIdx].sentence)}
              disabled={isRewriting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
            >
              {isRewriting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Rewriting...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Rewrite Sentence
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
