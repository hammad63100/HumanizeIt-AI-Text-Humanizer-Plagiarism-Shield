import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          Terms of Service &amp; Acceptable Use
        </h1>
        <p className="text-xs text-neutral-500">Last updated: October 14, 2026</p>
      </div>

      <div className="space-y-6 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            1. Purpose of the Platform
          </h2>
          <p>
            HumanizeIt is provided as an AI writing improvement and style restructuring assistant. The software is designed to refine tone, eliminate repetitive phrases, and help writers express their ideas clearly and naturally.
          </p>
        </section>

        <section className="space-y-2 p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
          <h2 className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            2. Academic Integrity &amp; User Responsibility
          </h2>
          <p className="text-xs leading-relaxed">
            Users agree that they are strictly responsible for complying with the honor codes, plagiarism policies, and editorial guidelines established by their academic institutions, universities, employers, and publishers. HumanizeIt does not promote academic dishonesty.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            3. Disclaimer Regarding AI Detectors
          </h2>
          <p>
            Statistical AI detection software (including GPTZero, Turnitin, Copyleaks, etc.) produces probabilistic estimates that frequently change and may generate false positives or false negatives. HumanizeIt explicitly disclaims any guarantee of a permanent or 100% &ldquo;undetectable&rdquo; bypass.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            4. Subscriptions, Limits &amp; Refunds
          </h2>
          <p>
            Paid subscriptions provide elevated word limits per request and per month. We provide a 14-day satisfaction refund guarantee upon request.
          </p>
        </section>
      </div>
    </div>
  );
}
