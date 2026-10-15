"use client";

interface GaugeProps {
  score: number; // 0 to 100
  label: string;
  sublabel?: string;
  size?: number;
}

function GaugeArc({ score, label, sublabel, size = 100 }: GaugeProps) {
  // SVG semi-circle gauge calculation
  const radius = 38;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  // We'll show a 240 degree gauge
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  // Color selection based on AI score (lower AI score is better for humanized text)
  let strokeColor = "#10b981"; // green (human)
  let statusText = "Likely Human";
  if (score > 60) {
    strokeColor = "#ef4444"; // red (AI)
    statusText = "High AI Likelihood";
  } else if (score >= 25) {
    strokeColor = "#f59e0b"; // amber (mixed)
    statusText = "Mixed / Moderate";
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size * 0.85 }}>
        <svg
          viewBox="0 0 100 85"
          className="w-full h-full transform -rotate-[210deg] origin-center"
        >
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeLinecap="round"
            className="text-neutral-200 dark:text-neutral-800"
          />
          {/* Active colored score */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {Math.round(score)}%
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            AI Score
          </span>
        </div>
      </div>

      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mt-1">
        {label}
      </span>
      <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
        {statusText}
      </span>
    </div>
  );
}

export function AiScoreGauge({
  scoreBefore = 89,
  scoreAfter = 12,
}: {
  scoreBefore?: number;
  scoreAfter?: number;
}) {
  const reduction = Math.max(0, scoreBefore - scoreAfter);

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-800/80">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            AI Likelihood Comparison
          </h4>
          <p className="text-[11px] text-neutral-500">Dual detector benchmark estimate</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20">
            -{reduction}% AI signal
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-2">
        <GaugeArc score={scoreBefore} label="Original Text" />
        <GaugeArc score={scoreAfter} label="Humanized Version" />
      </div>

      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
        <span className="italic">* Detector scores are estimates, not definitive proof.</span>
      </div>
    </div>
  );
}
