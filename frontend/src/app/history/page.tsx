"use client";

import { useEffect, useState } from "react";
import { DocumentHistoryItem } from "@/types/api";
import { apiClient } from "@/lib/api-client";
import { 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink,
  History,
  Layers
} from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const [docs, setDocs] = useState<DocumentHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DocumentHistoryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    apiClient.getDocuments().then((data) => {
      setDocs(data);
      if (data.length > 0) {
        setSelectedDoc(data[0]);
      }
    });
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteDocument(id);
      const updated = docs.filter((d) => d.id !== id);
      setDocs(updated);
      if (selectedDoc?.id === id) {
        setSelectedDoc(updated[0] || null);
      }
    } catch {
      // error handling
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDocs = docs.filter(
    (d) =>
      d.original_preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.rewritten_preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            Revision &amp; Document History
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Access, review, and export your past humanized drafts. You have full deletion control over your data.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past rewrites..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Grid: List on Left, Detail Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        {/* Document List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredDocs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No documents found</p>
              <p className="text-xs mt-1">Try another search or run a new rewrite in the dashboard.</p>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-sm"
                      : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {doc.mode} • {doc.tone}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-800 dark:text-neutral-200 font-medium line-clamp-2 mb-3">
                    {doc.rewritten_preview}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                    <span>{doc.word_count} words</span>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-500 font-bold">{doc.ai_score_before}%</span>
                      <span>&rarr;</span>
                      <span className="text-emerald-500 font-bold">{doc.ai_score_after}% AI</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Document Detail Preview (7 cols) */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                    Document Details
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Created on {new Date(selectedDoc.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedDoc.id, selectedDoc.rewritten_preview)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    {copiedId === selectedDoc.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Text
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(selectedDoc.id)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Metric stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/60 dark:border-neutral-800/60">
                  <span className="text-[10px] font-bold uppercase text-neutral-400">AI Reduction</span>
                  <div className="text-sm font-extrabold text-neutral-900 dark:text-white mt-0.5">
                    {selectedDoc.ai_score_before}% &rarr; {selectedDoc.ai_score_after}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/60 dark:border-neutral-800/60">
                  <span className="text-[10px] font-bold uppercase text-neutral-400">Meaning Score</span>
                  <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {selectedDoc.meaning_score}% Kept
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/60 dark:border-neutral-800/60">
                  <span className="text-[10px] font-bold uppercase text-neutral-400">Total Words</span>
                  <div className="text-sm font-extrabold text-neutral-900 dark:text-white mt-0.5">
                    {selectedDoc.word_count}
                  </div>
                </div>
              </div>

              {/* Rewritten Text */}
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Humanized Output
                </span>
                <div className="p-4 rounded-2xl bg-neutral-50/70 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 text-sm leading-relaxed text-neutral-800 dark:text-neutral-100">
                  {selectedDoc.rewritten_preview}
                </div>
              </div>

              {/* Original Draft */}
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Original Input Draft
                </span>
                <div className="p-4 rounded-2xl bg-neutral-50/40 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-500 leading-relaxed">
                  {selectedDoc.original_preview}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  href="/tool"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Re-open in Workspace
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400">
              Select a document to inspect full rewrite history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
