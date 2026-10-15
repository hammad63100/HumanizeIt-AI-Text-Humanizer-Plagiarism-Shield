"use client";

import { useState, useEffect } from "react";
import { useToolStore } from "@/store/toolStore";
import { useUsage } from "@/hooks/useUsage";
import { apiClient } from "@/lib/api-client";
import { VoiceProfile } from "@/types/api";
import { PLAN_LIMITS } from "@/lib/limits";
import { 
  User, 
  CreditCard, 
  Fingerprint, 
  Zap, 
  Plus, 
  Check, 
  Sparkles,
  BarChart3,
  Calendar
} from "lucide-react";

export default function AccountPage() {
  const { userPlan, setUpgradeModalOpen } = useToolStore();
  const { usage, loading: usageLoading } = useUsage();

  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);
  const [newProfileName, setNewProfileName] = useState("");
  const [newSampleText, setNewSampleText] = useState("");
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    apiClient.getVoiceProfiles().then(setVoiceProfiles).catch(() => {});
  }, []);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName || !newSampleText) return;

    setIsCreatingProfile(true);
    try {
      const created = await apiClient.createVoiceProfile({
        name: newProfileName,
        sample_text: newSampleText,
      });
      setVoiceProfiles([created, ...voiceProfiles]);
      setNewProfileName("");
      setNewSampleText("");
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
      // error handling
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const planInfo = PLAN_LIMITS[userPlan];
  const wordsUsed = usage?.words_used_today || 180;
  const usagePercentage = Math.min(100, Math.round((wordsUsed / planInfo.dailyWords) * 100));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 flex-1">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2.5">
          <User className="w-7 h-7 text-indigo-600" />
          Account, Usage &amp; Voice Match
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Monitor your plan usage limits and customize personal author voice profiles.
        </p>
      </div>

      {/* Grid: Plan Card & Usage Meter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Plan Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Subscription Plan
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 capitalize">
                {userPlan} Active
              </span>
            </div>

            <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">
              {planInfo.name}
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Allows up to {planInfo.maxWordsPerRequest} words per request and {planInfo.voiceMatchProfiles} custom writing voice profiles.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" /> Resets daily
            </div>
            <button
              type="button"
              onClick={() => setUpgradeModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
            >
              <Zap className="w-3.5 h-3.5" /> Manage / Upgrade
            </button>
          </div>
        </div>

        {/* Word Usage Meter */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Daily Word Balance
              </span>
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                {wordsUsed} / {planInfo.dailyWords} words
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-neutral-400">
              <span>{planInfo.dailyWords - wordsUsed} words left today</span>
              <span>{usagePercentage}% consumed</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/60 dark:border-neutral-800/60 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Word counter automatically resets every 24 hours at midnight UTC.</span>
          </div>
        </div>
      </div>

      {/* Voice Match Studio (PRD Key Feature) */}
      <div className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 mb-1">
              <Fingerprint className="w-3.5 h-3.5" /> Proprietary Feature
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Voice Match Studio
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Upload samples of your own authentic writing (200-500 words). The humanizer mimics your natural sentence length, vocabulary, and flow.
            </p>
          </div>
        </div>

        {/* Existing Profiles */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Active Writing Profiles ({voiceProfiles.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voiceProfiles.map((vp) => (
              <div
                key={vp.id}
                className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                    {vp.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {vp.sample_count} sample(s)
                  </span>
                </div>
                <p className="text-xs text-neutral-500 line-clamp-2">
                  {vp.description}
                </p>
                <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Avg length: ~{vp.avg_sentence_length} words</span>
                  <span>{vp.vocabulary_level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Train New Voice Profile Form */}
        <form onSubmit={handleCreateProfile} className="p-6 rounded-2xl bg-neutral-50/70 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" /> Train a New Voice Match Style
          </h4>

          {profileSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" /> Voice style successfully trained and saved!
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
              Profile Name (e.g. &ldquo;My Thesis Voice&rdquo; or &ldquo;Substack Newsletter&rdquo;)
            </label>
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="e.g. Tech Blogger Style"
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
              Writing Sample Text (200 - 500 words written originally by you)
            </label>
            <textarea
              rows={4}
              value={newSampleText}
              onChange={(e) => setNewSampleText(e.target.value)}
              placeholder="Paste a paragraph or article you wrote yourself. The engine analyzes sentence cadence, conjunction choices, and vocabulary density..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreatingProfile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isCreatingProfile ? "Analyzing & Training..." : "Train Voice Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
