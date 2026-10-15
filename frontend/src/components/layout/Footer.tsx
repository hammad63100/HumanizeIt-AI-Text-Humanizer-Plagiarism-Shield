import Link from "next/link";
import { Sparkles, ShieldCheck, HeartHandshake, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-neutral-900 dark:text-white">
                Humanize<span className="text-indigo-600 dark:text-indigo-400">It</span>
              </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md leading-relaxed">
              Transform stiff AI drafts into natural, human prose while verifying semantic meaning, AI likelihood, and source originality with our all-in-one writing suite.
            </p>
            <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Meaning-Lock Protected
              </span>
              <span className="flex items-center gap-1">
                <HeartHandshake className="w-4 h-4 text-indigo-500" /> Zero Data Training
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-200 mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <Link href="/tool" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  AI Humanizer Tool
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Pricing & Plans
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Voice Match Profiles
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Document History
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-200 mb-3">
              Resources & Legal
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <Link href="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Blog & Guides
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Privacy Policy & Ethics
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Transparency Disclaimer */}
        <div className="pt-8 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-500 leading-relaxed max-w-3xl">
            <strong className="text-neutral-700 dark:text-neutral-400">Notice & Ethics:</strong> AI detector scores are estimates and probabilistic indications, not definitive or infallible proof. HumanizeIt is designed as an editing and style improvement tool. Users are solely responsible for ensuring their usage complies with their educational, academic, and workplace guidelines.
          </p>
          <div className="text-xs text-neutral-500 dark:text-neutral-500 shrink-0">
            &copy; {new Date().getFullYear()} HumanizeIt. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
