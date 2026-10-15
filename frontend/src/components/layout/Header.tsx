"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, History, User, Zap, BookOpen } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useToolStore } from "@/store/toolStore";

export function Header() {
  const pathname = usePathname();
  const { userPlan, setUpgradeModalOpen } = useToolStore();

  const navLinks = [
    { href: "/tool", label: "Dashboard", icon: Sparkles },
    { href: "/pricing", label: "Pricing", icon: Zap },
    { href: "/history", label: "History", icon: History },
    { href: "/account", label: "Voice Match", icon: User },
    { href: "/blog", label: "Blog", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 dark:from-white dark:via-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">
                Humanize<span className="text-indigo-600 dark:text-indigo-400">It</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 -mt-1">
                AI & Plagiarism Shield
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Plan badge / Upgrade button */}
          <button
            onClick={() => setUpgradeModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="capitalize">{userPlan} Plan</span>
            <span className="text-neutral-400">•</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Upgrade</span>
          </button>

          <ThemeToggle />

          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Sign In
          </Link>

          <Link
            href="/tool"
            className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition-all hover:shadow-indigo-600/40 hover:-translate-y-0.5"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
