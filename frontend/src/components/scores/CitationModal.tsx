"use client";

import { useState } from "react";
import { X, Copy, Check, Quote } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export function CitationModal({
  isOpen,
  onClose,
  sourceUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  sourceUrl: string;
}) {
  const [style, setStyle] = useState<"APA" | "MLA" | "Chicago">("APA");
  const [copied, setCopied] = useState(false);
  const [customSource, setCustomSource] = useState(sourceUrl);

  if (!isOpen) return null;

  // Generate citation based on selected format
  const domain = (() => {
    try {
      return new URL(customSource || sourceUrl).hostname.replace("www.", "");
    } catch {
      return "Web Resource";
    }
  })();

  const currentYear = new Date().getFullYear();
  let citationText = "";

  if (style === "APA") {
    citationText = `${domain}. (${currentYear}). Online Reference Article. Retrieved from ${customSource || sourceUrl}`;
  } else if (style === "MLA") {
    citationText = `"${domain} Overview." Web Article, ${currentYear}, ${customSource || sourceUrl}. Accessed ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`;
  } else {
    citationText = `${domain}. "${domain} Reference Document." Last modified ${currentYear}. ${customSource || sourceUrl}.`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
              Generate Academic Citation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1 block">
            Source URL or Title
          </label>
          <input
            type="text"
            value={customSource || sourceUrl}
            onChange={(e) => setCustomSource(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 block">
            Citation Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["APA", "MLA", "Chicago"] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setStyle(fmt)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  style === fmt
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                }`}
              >
                {fmt} 7th
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <p className="text-xs font-mono text-neutral-800 dark:text-neutral-200 leading-relaxed select-all">
            {citationText}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Citation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
