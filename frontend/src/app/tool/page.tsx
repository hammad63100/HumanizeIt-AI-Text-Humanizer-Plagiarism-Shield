"use client";

import { useEffect, useState } from "react";
import { InputBox } from "@/components/editor/InputBox";
import { OutputBox } from "@/components/editor/OutputBox";
import { useToolStore } from "@/store/toolStore";
import { apiClient } from "@/lib/api-client";
import { VoiceProfile } from "@/types/api";
import { Sparkles, Fingerprint, Zap, RefreshCw } from "lucide-react";

export default function ToolWorkspacePage() {
  const { userPlan, setUpgradeModalOpen, activeVoiceProfileId, setActiveVoiceProfileId, resetEditor } = useToolStore();
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);

  useEffect(() => {
    apiClient.getVoiceProfiles().then(setVoiceProfiles).catch(() => {});
  }, []);

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Workspace Header & Context Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              Humanizer Dashboard
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                Live Studio
              </span>
            </h1>
            <p className="text-xs text-neutral-500">
              Interactive rewrite canvas with Before/After AI benchmarks and plagiarism analysis
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Voice Match Profile selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs">
            <Fingerprint className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-neutral-500">Voice:</span>
            <select
              value={activeVoiceProfileId || ""}
              onChange={(e) => setActiveVoiceProfileId(e.target.value || undefined)}
              className="bg-transparent font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="">Default AI Humanizer</option>
              {voiceProfiles.map((vp) => (
                <option key={vp.id} value={vp.id}>
                  {vp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={resetEditor}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
            title="Reset workspace"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>

          {/* Plan badge */}
          <button
            type="button"
            onClick={() => setUpgradeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="capitalize">{userPlan} Plan</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Interactive Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <InputBox />
        <OutputBox />
      </div>
    </div>
  );
}
