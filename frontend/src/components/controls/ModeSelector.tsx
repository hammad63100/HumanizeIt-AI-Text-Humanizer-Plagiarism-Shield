"use client";

import { useToolStore } from "@/store/toolStore";
import { RewriteMode } from "@/types/api";
import { Feather, Compass, Flame } from "lucide-react";

export function ModeSelector() {
  const { mode, setMode } = useToolStore();

  const modes: { id: RewriteMode; label: string; desc: string; icon: any }[] = [
    {
      id: "light",
      label: "Light",
      desc: "Minor smoothing, keeps exact syntax",
      icon: Feather,
    },
    {
      id: "balanced",
      label: "Balanced",
      desc: "Natural human rhythm & varied pace",
      icon: Compass,
    },
    {
      id: "strong",
      label: "Strong",
      desc: "Reorganizes phrasing for maximum flow",
      icon: Flame,
    },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Rewrite Mode
        </label>
        <span className="text-[11px] text-neutral-400 font-medium">Controls rewriting depth</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-neutral-900 dark:text-white shadow-sm ring-1 ring-indigo-600/30"
                  : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-400"}`} />
                  {m.label}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? "bg-indigo-600" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                />
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
                {m.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
