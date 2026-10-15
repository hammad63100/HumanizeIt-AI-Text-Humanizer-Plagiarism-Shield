"use client";

import { useState } from "react";
import { useToolStore } from "@/store/toolStore";
import { useHumanize } from "@/hooks/useHumanize";
import { usePlagiarism } from "@/hooks/usePlagiarism";
import { countWords } from "@/lib/utils";
import { DiffView } from "./DiffView";
import { SentenceHighlight } from "./SentenceHighlight";
import { AiScoreGauge } from "../scores/AiScoreGauge";
import { MeaningBadge } from "../scores/MeaningBadge";
import { PlagiarismReport } from "../scores/PlagiarismReport";
import { 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  ShieldAlert, 
  Layers, 
  GitCompare, 
  Activity,
  FileCheck2,
  Sparkles
} from "lucide-react";

export function OutputBox() {
  const {
    inputText,
    outputText,
    setOutputText,
    currentJob,
    plagiarismResult,
    activeTab,
    setActiveTab,
    isHumanizing,
    isCheckingPlagiarism,
  } = useToolStore();

  const { startHumanize } = useHumanize();
  const { checkPlagiarism } = usePlagiarism();

  const [copied, setCopied] = useState(false);

  const wordCount = countWords(outputText);

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `humanized-text-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSentenceUpdated = (idx: number, newSentence: string) => {
    if (!currentJob?.sentence_scores) return;
    const updatedScores = [...currentJob.sentence_scores];
    updatedScores[idx] = {
      ...updatedScores[idx],
      sentence: newSentence,
      ai_probability: 0.12,
      flagged: false,
    };
    const newFullText = updatedScores.map((s) => s.sentence).join(" ");
    setOutputText(newFullText);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
      {/* Top Bar with Navigation Tabs */}
      <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 bg-neutral-50/50 dark:bg-neutral-900/50">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("result")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "result"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Result
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("diff")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "diff"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" /> Changes
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("scores")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "scores"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> AI Scores
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("plagiarism")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "plagiarism"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Plagiarism
          </button>
        </div>

        {/* Meaning Score Pill if available */}
        {currentJob?.meaning_score && (
          <MeaningBadge score={currentJob.meaning_score} />
        )}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-5 min-h-[300px] md:min-h-[420px] overflow-y-auto">
        {/* Tab 1: Result */}
        {activeTab === "result" && (
          <div className="h-full flex flex-col justify-between">
            {outputText ? (
              <div className="space-y-4">
                {currentJob?.sentence_scores ? (
                  <SentenceHighlight
                    sentences={currentJob.sentence_scores}
                    onSentenceUpdated={handleSentenceUpdated}
                  />
                ) : (
                  <p className="text-sm md:text-base leading-relaxed text-neutral-800 dark:text-neutral-100 whitespace-pre-wrap select-text">
                    {outputText}
                  </p>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-neutral-800/80 flex items-center justify-center text-indigo-500 mb-3">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-neutral-700 dark:text-neutral-200 text-sm">
                  Your humanized text will appear here
                </h3>
                <p className="text-xs text-neutral-400 max-w-xs mt-1">
                  Paste your text in the left pane and click &ldquo;Humanize Text&rdquo; to start.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Diff View */}
        {activeTab === "diff" && (
          <DiffView originalText={inputText} rewrittenText={outputText} />
        )}

        {/* Tab 3: AI Scores */}
        {activeTab === "scores" && (
          <div className="space-y-4">
            <AiScoreGauge
              scoreBefore={currentJob?.ai_score_before || 88}
              scoreAfter={currentJob?.ai_score_after || 11}
            />

            {currentJob?.sentence_scores && (
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-3">
                  Sentence-by-Sentence AI Probability Breakdown
                </h5>
                <SentenceHighlight
                  sentences={currentJob.sentence_scores}
                  onSentenceUpdated={handleSentenceUpdated}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Plagiarism */}
        {activeTab === "plagiarism" && (
          <PlagiarismReport
            result={plagiarismResult}
            onRewriteFlagged={startHumanize}
          />
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-neutral-500 font-medium">
          {outputText ? (
            <span>{wordCount} words generated</span>
          ) : (
            <span>Ready for input</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {outputText && (
            <>
              <button
                type="button"
                onClick={checkPlagiarism}
                disabled={isCheckingPlagiarism}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <FileCheck2 className={`w-3.5 h-3.5 text-indigo-500 ${isCheckingPlagiarism ? "animate-spin" : ""}`} />
                {isCheckingPlagiarism ? "Scanning Sources..." : "Check Plagiarism"}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                title="Download as .txt"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>

              <button
                type="button"
                onClick={startHumanize}
                disabled={isHumanizing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                title="Regenerate alternative human phrasing"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isHumanizing ? "animate-spin" : ""}`} /> Regenerate
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
