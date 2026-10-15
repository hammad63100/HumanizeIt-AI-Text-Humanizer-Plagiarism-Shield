"use client";

import { useToolStore } from "@/store/toolStore";
import { RewriteTone } from "@/types/api";
import { Briefcase, GraduationCap, Coffee, Smile, PenTool } from "lucide-react";

export function ToneSelector() {
  const { tone, setTone } = useToolStore();

  const tones: { id: RewriteTone; label: string; icon: any }[] = [
    { id: "professional", label: "Professional", icon: Briefcase },
    { id: "academic", label: "Academic", icon: GraduationCap },
    { id: "casual", label: "Casual", icon: Coffee },
    { id: "friendly", label: "Friendly", icon: Smile },
    { id: "blog", label: "Blog & SEO", icon: PenTool },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Target Tone
        </label>
        <span className="text-[11px] text-neutral-400 font-medium">Vocabulary & voice</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tones.map((t) => {
          const Icon = t.icon;
          const isSelected = tone === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTone(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5 opacity-80" />
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
