"use client";

import { Check, X, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { useToolStore } from "@/store/toolStore";

export default function PricingPage() {
  const { userPlan, setUserPlan, setUpgradeModalOpen } = useToolStore();

  const plans = [
    {
      id: "free",
      name: "Guest & Free",
      price: "$0",
      period: "forever",
      desc: "For testing and quick short rewrites without signing up.",
      wordsPerReq: "300 words",
      monthlyQuota: "1,000 words / day",
      plagiarism: "3 checks / day",
      voiceMatch: "0 profiles",
      features: [
        "Light & Balanced rewrite modes",
        "Dual AI probability gauge",
        "Diff-view highlighting",
        "Zero sign-up required",
      ],
      cta: "Current Free Tier",
      disabled: userPlan === "free",
      popular: false,
    },
    {
      id: "pro",
      name: "Pro Writer",
      price: "$9.99",
      period: "per month",
      desc: "Perfect for students, freelancers, and consistent content creators.",
      wordsPerReq: "3,000 words",
      monthlyQuota: "50,000 words / mo",
      plagiarism: "100 checks / mo",
      voiceMatch: "3 custom profiles",
      features: [
        "All 3 rewrite modes (Light, Balanced, Strong)",
        "Meaning-Lock semantic verification",
        "Single-sentence rewrite tools",
        "Citation Helper (APA, MLA, Chicago)",
        "Fast priority processing",
      ],
      cta: "Upgrade to Pro",
      popular: false,
    },
    {
      id: "premium",
      name: "Unlimited Master",
      price: "$19.99",
      period: "per month",
      desc: "For professional bloggers, book authors, and heavy publishers.",
      wordsPerReq: "6,000 words",
      monthlyQuota: "200,000 words / mo",
      plagiarism: "500 checks / mo",
      voiceMatch: "10 custom profiles",
      features: [
        "Maximum humanization depth",
        "Deep academic journal plagiarism check",
        "Bulk document upload (.docx / .pdf)",
        "Instant sentence-by-sentence analysis",
        "Priority VIP server queue",
      ],
      cta: "Get Unlimited Master",
      popular: true,
    },
    {
      id: "team",
      name: "Team & Agency",
      price: "$49.99",
      period: "per month",
      desc: "Multi-seat editorial workspaces and high-volume marketing teams.",
      wordsPerReq: "10,000 words",
      monthlyQuota: "1,000,000 words / mo",
      plagiarism: "2,000 checks / mo",
      voiceMatch: "50 shared profiles",
      features: [
        "Shared team brand voice guidelines",
        "Centralized billing & usage metrics",
        "REST API & Webhooks access",
        "Dedicated account support",
      ],
      cta: "Contact Team Sales",
      popular: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <Zap className="w-3.5 h-3.5" /> Transparent, Affordable Plans
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white">
          Simple Pricing for Real Human Writing
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400">
          No hidden fees, no predatory contracts. Switch or cancel anytime with our 14-day money-back guarantee.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((p) => {
          const isSelected = userPlan === p.id;
          return (
            <div
              key={p.id}
              className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all ${
                p.popular
                  ? "border-2 border-indigo-600 bg-white dark:bg-neutral-900 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-600/20"
                  : "border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-sm">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="font-bold text-lg text-neutral-900 dark:text-white">{p.name}</h3>
                <p className="text-xs text-neutral-500 mt-1 min-h-[32px]">{p.desc}</p>

                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-neutral-900 dark:text-white">
                    {p.price}
                  </span>
                  <span className="text-neutral-500 text-xs"> /{p.period}</span>
                </div>

                <div className="space-y-2 py-3 border-y border-neutral-100 dark:border-neutral-800 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Max per request:</span>
                    <strong className="text-neutral-800 dark:text-neutral-200">{p.wordsPerReq}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Monthly words:</span>
                    <strong className="text-neutral-800 dark:text-neutral-200">{p.monthlyQuota}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Plagiarism checks:</span>
                    <strong className="text-neutral-800 dark:text-neutral-200">{p.plagiarism}</strong>
                  </div>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
                  {p.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUserPlan(p.id as any);
                  setUpgradeModalOpen(true);
                }}
                disabled={isSelected}
                className={`mt-8 w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                  isSelected
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-default"
                    : p.popular
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30"
                    : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                }`}
              >
                {isSelected ? "Current Plan" : p.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="p-8 rounded-3xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-bold text-neutral-900 dark:text-white text-base">
              14-Day Full Satisfaction Guarantee
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5 max-w-lg leading-relaxed">
              If HumanizeIt does not significantly enhance your writing cadence and natural readability, simply email support within 14 days for a no-questions-asked refund.
            </p>
          </div>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium shrink-0">
          🔒 Secure 256-Bit SSL Encrypted Checkout via Stripe
        </div>
      </div>
    </div>
  );
}
