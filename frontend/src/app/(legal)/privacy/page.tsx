import Link from "next/link";
import { HeartHandshake, ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <div className="space-y-3 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">
          Privacy Policy &amp; Zero-Training Guarantee
        </h1>
        <p className="text-xs text-neutral-500">Last updated: October 14, 2026</p>
      </div>

      <div className="space-y-6 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
        <section className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 text-indigo-900 dark:text-indigo-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <HeartHandshake className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            1. Zero Data Training Policy
          </div>
          <p className="text-xs leading-relaxed">
            Your submitted text, personal writing samples, and rewritten drafts are <strong>never</strong> used to train or fine-tune public foundation AI models. We use enterprise zero-retention API contracts with LLM providers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            2. Transient Storage for Guests
          </h2>
          <p>
            For guest users who do not create an account, input text and generated outputs are stored transiently in your own client browser&apos;s session storage and are discarded when you close your browser tab.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            3. User Data Rights &amp; Permanent Deletion
          </h2>
          <p>
            Authenticated users can permanently delete any document history item at any time from their History dashboard. Deletion purges all text records, embedding vectors, and scan reports from our databases immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            4. Analytics Privacy
          </h2>
          <p>
            Our product analytics solely log performance and feature metrics (such as word count totals, selected mode, and tone). We programmatically scrub and strip all actual document sentences from event payloads before dispatching.
          </p>
        </section>
      </div>
    </div>
  );
}
