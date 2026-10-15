import Link from "next/link";
import { ArrowLeft, Calendar, User, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

const postContentMap: Record<string, { title: string; date: string; author: string; content: string[] }> = {
  "why-ai-detectors-flag-human-writing": {
    title: "Why AI Detectors Keep Flagging Human Writing (And What To Do About It)",
    date: "October 12, 2026",
    author: "Editorial Team",
    content: [
      "AI text detectors like Turnitin, GPTZero, and Originality rely primarily on two metrics: perplexity (how unpredictable the words are) and burstiness (the variation in sentence length and rhythm).",
      "When a human writer adheres closely to conventional grammar templates or formal corporate guidelines, their text naturally exhibits low perplexity and even burstiness. Consequently, statistical classifiers frequently mislabel their genuine work as machine-generated.",
      "To counter this without compromising grammatical precision, writers should vary sentence pacing deliberately: mix crisp three-word sentences with longer descriptive thoughts, swap standard transition words like 'furthermore' for conversational equivalents, and infuse authentic personal perspective.",
    ],
  },
  "difference-between-mosaic-plagiarism-and-rewriting": {
    title: "The Critical Difference Between Mosaic Plagiarism and Ethical Rewriting",
    date: "October 8, 2026",
    author: "Academic Advisory",
    content: [
      "Mosaic plagiarism occurs when a student or author keeps the exact grammatical structure of another author's work and merely replaces individual words with dictionary synonyms. Modern plagiarism algorithms easily identify this pattern.",
      "Ethical humanization, by contrast, fundamentally deconstructs the conceptual premise and reconstructs the logic using original phrasing and sentence structures.",
      "Whenever you rely on empirical data or unique insights, you must always cite the primary source. HumanizeIt includes a built-in citation helper to make attribution seamless across APA, MLA, and Chicago standards.",
    ],
  },
  "how-voice-match-breaks-ai-detector-patterns": {
    title: "How Voice Match Breaks Standard AI Detector Patterns",
    date: "September 29, 2026",
    author: "NLP Engineering",
    content: [
      "Generative language models produce text using next-token probability distributions tuned to average human consensus. This inherent 'averageness' is precisely what detectors flag.",
      "Our Voice Match engine computes your unique stylistic fingerprint—your distinct ratio of dependent clauses, favorite modifiers, and sentence length variances.",
      "Applying your personal voice profile to rewritten drafts ensures the final prose reads like you, rather than an anonymous algorithmic output.",
    ],
  },
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = postContentMap[params.slug];

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-8">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to all articles
      </Link>

      <div className="space-y-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {post.date}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> {post.author}
          </span>
        </div>
      </div>

      <div className="space-y-6 text-sm md:text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
        {post.content.map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-4 mt-8">
        <div>
          <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
            Try HumanizeIt on your drafts
          </h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            Zero sign-up required. Free 300 words instantly.
          </p>
        </div>
        <Link
          href="/tool"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-md shadow-indigo-600/20"
        >
          Open Dashboard
        </Link>
      </div>
    </article>
  );
}
