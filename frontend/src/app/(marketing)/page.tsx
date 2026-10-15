import Link from "next/link";
import { InputBox } from "@/components/editor/InputBox";
import { OutputBox } from "@/components/editor/OutputBox";
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Search, 
  CheckCircle2, 
  ArrowRight,
  Fingerprint,
  Layers,
  HelpCircle
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section with Ambient Glow */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none glow-gradient -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span>Zero-Barrier Access — Paste &amp; Humanize Instantly</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.12]">
              Turn Stiff AI Drafts Into{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Natural Human Prose
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
              No robotic cliches or same-length sentences. Get authentic phrasing with real-time 
              Before/After AI scores and plagiarism checking on one unified screen.
            </p>
          </div>

          {/* Core Interactive Split Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <InputBox />
            <OutputBox />
          </div>

          {/* Quick Credibility Trust Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Meaning-Lock Protected
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-4 h-4 text-amber-500" /> Fast Dual AI Scoring
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Search className="w-4 h-4 text-indigo-500" /> Web &amp; Academic Plagiarism Scan
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Fingerprint className="w-4 h-4 text-violet-500" /> Voice Match Cloning
            </span>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 md:py-24 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Why HumanizeIt Stands Out
            </h2>
            <h3 className="text-3xl font-extrabold text-neutral-900 dark:text-white">
              Built for Writers, Students &amp; Creators
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Unlike simple synonym spinners that destroy your arguments, HumanizeIt reconstructs syntax rhythm while preserving factual integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-neutral-900 dark:text-white">
                Meaning-Lock Verification
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Vector embedding checks ensure your original arguments and statistics are preserved. If meaning drift exceeds 15%, the system immediately flags it.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-neutral-900 dark:text-white">
                Custom Voice Match
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Upload your past essays or articles. The engine analyzes your specific sentence lengths, preferred transitions, and vocabulary for unmatched authenticity.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-neutral-900 dark:text-white">
                All-in-One Plagiarism &amp; Citations
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Check similarity against millions of web pages and scholarly papers. Generate instant APA, MLA, or Chicago citations with a single click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: AI Generated vs Humanized */}
      <section className="py-16 md:py-20 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white">
              See The Real Difference
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
              Standard AI drafts sound monotonic and repetitive. HumanizeIt injects varied cadence and natural word choice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Raw AI Draft */}
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                  Raw AI Draft
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                  88% AI Detected
                </span>
              </div>
              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-mono">
                &ldquo;In today&apos;s fast-paced digital era, it is of paramount importance to systematically utilize comprehensive methodologies to optimize organizational workflows and maximize cross-functional synergies.&rdquo;
              </p>
              <div className="pt-2 text-[11px] text-neutral-400">
                ❌ Stiff buzzwords, predictable rhythm, flagged by detectors
              </div>
            </div>

            {/* Humanized Version */}
            <div className="p-6 rounded-3xl bg-indigo-50/40 dark:bg-indigo-950/20 border-2 border-indigo-600/30 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/40">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  HumanizeIt Result
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  12% AI (Human)
                </span>
              </div>
              <p className="text-xs md:text-sm text-neutral-800 dark:text-neutral-100 leading-relaxed font-sans">
                &ldquo;Today, we really need to use practical methods to improve day-to-day work and help teams collaborate smoothly across every department.&rdquo;
              </p>
              <div className="pt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Natural voice, identical core meaning, authentic rhythm
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 md:py-24 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-extrabold text-neutral-900 dark:text-white">
              Frequently Asked Questions
            </h3>
            <p className="text-sm text-neutral-500">
              Clear, honest answers about AI detection and rewrite capabilities.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 space-y-2">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                Can any tool guarantee a 100% bypass of AI detectors?
              </h4>
              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                No tool can honestly guarantee a 100% bypass. Detectors update their heuristics constantly and frequently produce false positives even on human writing. HumanizeIt rewrites repetitive patterns into natural, varied human cadence and gives you dual before/after scores so you can review the results.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 space-y-2">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                What is the Meaning-Lock score?
              </h4>
              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Meaning-Lock calculates semantic vector similarity between your original text and the humanized version. It guarantees that the arguments, facts, and conclusions remain identical, while improving phrasing and syntax.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 space-y-2">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                Is my submitted text saved or used to train AI models?
              </h4>
              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Never. We enforce a zero-training privacy policy. Guest sessions are stored transiently in your own browser session, and you can delete saved document histories at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-gradient-to-tr from-indigo-900 to-neutral-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to humanize your writing today?
          </h2>
          <p className="text-indigo-200 text-sm max-w-xl mx-auto">
            Paste your draft and test your first 300 words completely free with zero sign-up required.
          </p>
          <div>
            <Link
              href="/tool"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-white text-indigo-900 hover:bg-neutral-100 shadow-xl transition-all hover:scale-105"
            >
              Open Humanizer Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
