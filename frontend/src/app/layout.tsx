import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { UpgradeModal } from "@/components/layout/UpgradeModal";

export const metadata: Metadata = {
  title: "HumanizeIt — AI Text Humanizer & Plagiarism Shield",
  description:
    "Transform robotic AI drafts into natural, human prose with real-time AI likelihood scoring, Meaning-Lock preservation, and deep plagiarism scanning.",
  keywords: [
    "AI Humanizer",
    "AI text bypass",
    "Turnitin AI detector",
    "GPTZero score",
    "Plagiarism checker",
    "Rewriter tool",
    "Humanize AI",
  ],
  openGraph: {
    title: "HumanizeIt — Turn AI Drafts into Authentic Human Prose",
    description:
      "All-in-one workspace: Instant rewriting, Before & After AI detector scores, and plagiarism verification.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-neutral-50/50 dark:bg-neutral-950 font-sans antialiased text-neutral-900 dark:text-neutral-100 selection:bg-indigo-500 selection:text-white">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <UpgradeModal />
      </body>
    </html>
  );
}
