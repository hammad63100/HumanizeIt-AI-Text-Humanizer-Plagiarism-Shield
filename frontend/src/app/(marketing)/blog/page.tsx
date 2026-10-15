import Link from "next/link";
import { BookOpen, Calendar, ArrowRight, Sparkles } from "lucide-react";

const posts = [
  {
    slug: "why-ai-detectors-flag-human-writing",
    title: "Why AI Detectors Keep Flagging Human Writing (And What To Do About It)",
    excerpt:
      "Perplexity, burstiness, and formulaic sentence structures can cause false positives even in original human essays. Here is how to fix it.",
    date: "Oct 12, 2026",
    readTime: "5 min read",
    category: "AI Detection",
  },
  {
    slug: "difference-between-mosaic-plagiarism-and-rewriting",
    title: "The Critical Difference Between Mosaic Plagiarism and Ethical Rewriting",
    excerpt:
      "Simply replacing words with synonyms is classified by universities as mosaic plagiarism. Learn how to reconstruct syntax and cite sources properly.",
    date: "Oct 8, 2026",
    readTime: "7 min read",
    category: "Academic Integrity",
  },
  {
    slug: "how-voice-match-breaks-ai-detector-patterns",
    title: "How Voice Match Breaks Standard AI Detector Patterns",
    excerpt:
      "By analyzing your personal writing cadence, Voice Match replaces robotic LLM phrasing with your unique author style.",
    date: "Sep 29, 2026",
    readTime: "4 min read",
    category: "Technology",
  },
];

export default function BlogIndexPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
          <BookOpen className="w-3.5 h-3.5" /> Educational Guides &amp; Research
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white">
          Writing, AI Detection &amp; Academic Integrity
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Deep-dives into how large language models generate text, how detectors work, and how to preserve your authentic voice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between group space-y-4"
          >
            <div className="space-y-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                {post.category}
              </span>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {post.date}
              </span>
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                Read <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
