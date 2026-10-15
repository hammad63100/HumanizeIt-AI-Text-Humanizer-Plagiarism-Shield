"use client";

import { useRef } from "react";
import { useToolStore } from "@/store/toolStore";
import { countWords } from "@/lib/utils";
import { checkWordLimit } from "@/lib/limits";
import { ModeSelector } from "../controls/ModeSelector";
import { ToneSelector } from "../controls/ToneSelector";
import { HumanizeButton } from "../controls/HumanizeButton";
import { Trash2, Clipboard, FileUp, Sparkles } from "lucide-react";

const SAMPLE_TEXT = `Furthermore, it is universally acknowledged that artificial intelligence systems inherently present substantial opportunities for streamlining administrative redundancies. In light of these considerations, modern enterprise organizations must proactively optimize their technological frameworks to ensure optimal efficacy across all operational workflows.`;

export function InputBox() {
  const { inputText, setInputText, userPlan, setUpgradeModalOpen } = useToolStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = countWords(inputText);
  const limit = checkWordLimit(wordCount, userPlan);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
      }
    } catch {
      // clipboard access denied
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
      }
    };
    reader.readAsText(file);
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
      {/* Top Bar */}
      <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Original Text
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            AI Draft / Input
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setInputText(SAMPLE_TEXT)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
            title="Load sample AI text"
          >
            <Sparkles className="w-3.5 h-3.5" /> Sample
          </button>

          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5" /> Paste
          </button>

          <label
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
            title="Upload .txt or document"
          >
            <FileUp className="w-3.5 h-3.5" /> Upload
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {inputText && (
            <button
              type="button"
              onClick={() => setInputText("")}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Text Area */}
      <div className="relative flex-1 p-5 min-h-[260px] md:min-h-[320px]">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your AI-generated text, draft essay, or blog article here..."
          className="w-full h-full resize-none bg-transparent text-sm md:text-base leading-relaxed text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
        />

        {/* Floating Word Counter & Limit Meter */}
        <div className="absolute bottom-4 right-5 flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border transition-all ${
              limit.isOver
                ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse"
                : limit.isNear
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400"
            }`}
          >
            <span>
              {wordCount} / {limit.max} words
            </span>
          </div>

          {limit.isOver && (
            <button
              type="button"
              onClick={() => setUpgradeModalOpen(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700"
            >
              Increase Limit
            </button>
          )}
        </div>
      </div>

      {/* Controls & Submit Area */}
      <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 space-y-4">
        <ModeSelector />
        <ToneSelector />
        <HumanizeButton />
      </div>
    </div>
  );
}
