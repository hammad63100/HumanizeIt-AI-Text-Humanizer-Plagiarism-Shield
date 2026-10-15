"use client";

import { X, Check, Zap, Sparkles, ShieldCheck } from "lucide-react";
import { useToolStore } from "@/store/toolStore";
import { PLAN_LIMITS } from "@/lib/limits";

export function UpgradeModal() {
  const { upgradeModalOpen, setUpgradeModalOpen, userPlan, setUserPlan } = useToolStore();

  if (!upgradeModalOpen) return null;

  const handleSelectPlan = (planKey: "pro" | "premium" | "team") => {
    setUserPlan(planKey);
    setUpgradeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between bg-gradient-to-r from-indigo-50/50 via-white to-violet-50/50 dark:from-indigo-950/20 dark:via-neutral-900 dark:to-violet-950/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 mb-2">
              <Zap className="w-3.5 h-3.5" /> Unlock Full Writing Potential
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white">
              Upgrade Your Word Limits & Powers
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Need to rewrite long essays or high-volume articles? Choose the plan tailored for your writing goals.
            </p>
          </div>
          <button
            onClick={() => setUpgradeModalOpen(false)}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pro Card */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col justify-between hover:border-indigo-400 transition-all bg-neutral-50/50 dark:bg-neutral-950/50">
            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Pro Writer</h3>
              <p className="text-xs text-neutral-500 mt-1">Ideal for students & content creators</p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-extrabold text-neutral-900 dark:text-white">$9.99</span>
                <span className="text-neutral-500 text-sm"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <strong>3,000 words</strong> per request
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <strong>50,000 words</strong> per month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  100 Plagiarism scans/month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  3 Voice Match profiles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  Citation Helper (APA/MLA/Chicago)
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPlan("pro")}
              className="mt-6 w-full py-2.5 px-4 rounded-xl font-semibold text-xs border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
            >
              {userPlan === "pro" ? "Current Plan" : "Choose Pro"}
            </button>
          </div>

          {/* Premium Card (Highlighted) */}
          <div className="relative rounded-2xl border-2 border-indigo-600 p-6 flex flex-col justify-between bg-gradient-to-b from-indigo-500/[0.04] to-transparent dark:from-indigo-950/40 shadow-xl shadow-indigo-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-sm">
              Most Popular
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Unlimited Master</h3>
              <p className="text-xs text-neutral-500 mt-1">For heavy bloggers & professional authors</p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-extrabold text-neutral-900 dark:text-white">$19.99</span>
                <span className="text-neutral-500 text-sm"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <strong>6,000 words</strong> per request
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <strong>200,000 words</strong> per month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  500 Plagiarism scans/month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  10 Custom Voice Match styles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  Priority LLM rewrite speed
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPlan("premium")}
              className="mt-6 w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50"
            >
              {userPlan === "premium" ? "Current Plan" : "Get Unlimited Master"}
            </button>
          </div>

          {/* Team Card */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col justify-between hover:border-indigo-400 transition-all bg-neutral-50/50 dark:bg-neutral-950/50">
            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Team & Agency</h3>
              <p className="text-xs text-neutral-500 mt-1">Multi-seat agency & editorial teams</p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-extrabold text-neutral-900 dark:text-white">$49.99</span>
                <span className="text-neutral-500 text-sm"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <strong>10,000 words</strong> per request
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <strong>1,000,000 words</strong> monthly pool
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  Shared Team Voice Profiles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  REST API & Webhooks Access
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  Dedicated Account Support
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPlan("team")}
              className="mt-6 w-full py-2.5 px-4 rounded-xl font-semibold text-xs border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 transition-colors"
            >
              {userPlan === "team" ? "Current Plan" : "Choose Team"}
            </button>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="p-4 bg-neutral-100/70 dark:bg-neutral-800/40 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-center gap-6 text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> 14-Day Money-Back Guarantee
          </span>
          <span>•</span>
          <span>Cancel or switch tiers anytime</span>
          <span>•</span>
          <span>Instant activation</span>
        </div>
      </div>
    </div>
  );
}
