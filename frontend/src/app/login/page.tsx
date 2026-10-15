"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-neutral-900 p-8 sm:p-10 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-neutral-900 dark:text-white">
              Humanize<span className="text-indigo-600 dark:text-indigo-400">It</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h2>
          <p className="text-xs text-neutral-500">
            {isSignUp
              ? "Start saving your revision history and custom voice styles."
              : "Sign in to access your quota, Voice Match, and documents."}
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/tool";
            }}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-neutral-200 dark:border-neutral-800 w-full" />
            <span className="bg-white dark:bg-neutral-900 px-3 text-[11px] uppercase tracking-wider text-neutral-400">
              Or email
            </span>
            <div className="border-t border-neutral-200 dark:border-neutral-800 w-full" />
          </div>

          {submitted ? (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto">
                <Mail className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                Magic Link Sent!
              </h4>
              <p className="text-[11px] text-neutral-500">
                Check <strong>{email}</strong> for your secure login link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span>{isSignUp ? "Sign Up with Email" : "Sign In with Magic Link"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Toggle sign in / sign up */}
        <div className="pt-2 text-center text-xs text-neutral-500 space-y-2">
          <div>
            {isSignUp ? "Already have an account? " : "Don't have an account yet? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setSubmitted(false);
              }}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>

          <div>
            <Link href="/tool" className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
              &larr; Or continue testing as guest without signing in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
