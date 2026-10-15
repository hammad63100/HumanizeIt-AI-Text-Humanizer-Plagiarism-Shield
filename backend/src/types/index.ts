// =============================================
// Shared TypeScript types for the backend
// =============================================

// ---- User & Auth ----
export type PlanTier = 'guest' | 'free' | 'pro' | 'premium' | 'team';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  plan: PlanTier;
  created_at: Date;
}

export interface AuthPayload {
  userId: string;
  email: string;
  plan: PlanTier;
}

export interface GuestSession {
  sessionId: string;
  createdAt: Date;
}

// ---- Documents ----
export type RewriteMode = 'light' | 'balanced' | 'strong';

export interface Document {
  id: string;
  user_id: string | null;
  original_text: string;
  rewritten_text: string | null;
  mode: RewriteMode;
  tone: string | null;
  word_count: number;
  meaning_score: number | null;
  created_at: Date;
}

// ---- Jobs ----
export type JobType = 'humanize' | 'plagiarism' | 'detect';
export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

export interface Job {
  id: string;
  user_id: string | null;
  session_id: string | null;
  type: JobType;
  status: JobStatus;
  document_id: string | null;
  error: string | null;
  created_at: Date;
  finished_at: Date | null;
}

// ---- Scans ----
export interface Scan {
  id: string;
  document_id: string;
  ai_score_before: number | null;
  ai_score_after: number | null;
  plagiarism_percent: number | null;
  sources: Record<string, unknown>[] | null;
  created_at: Date;
}

// ---- Voice Profiles ----
export interface VoiceProfile {
  id: string;
  user_id: string;
  style: Record<string, unknown>;
  created_at: Date;
}

// ---- Usage ----
export interface UsageDaily {
  user_id: string;
  day: string; // ISO date string YYYY-MM-DD
  words_used: number;
}

// ---- Subscriptions ----
export type BillingProvider = 'stripe' | 'paddle' | 'lemonsqueezy';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface Subscription {
  id: string;
  user_id: string;
  provider: BillingProvider;
  provider_customer_id: string;
  status: SubscriptionStatus;
  renews_at: Date | null;
}

// ---- API Request/Response shapes ----
export interface HumanizeRequest {
  text: string;
  mode: RewriteMode;
  tone?: string;
  voice_profile_id?: string;
}

export interface DetectRequest {
  text: string;
}

export interface PlagiarismRequest {
  text: string;
}

export interface RewriteSentenceRequest {
  sentence: string;
  context: string;
  mode?: RewriteMode;
}

export interface CitationRequest {
  source_url?: string;
  source_text?: string;
  format?: 'apa' | 'mla' | 'chicago' | 'harvard';
}

export interface CheckoutRequest {
  plan: PlanTier;
}

// ---- API Standard Responses ----
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface JobResponse {
  id: string;
  type: JobType;
  status: JobStatus;
  document_id: string | null;
  error: string | null;
  created_at: string;
  finished_at: string | null;
  result?: {
    original_text: string;
    rewritten_text: string | null;
    word_count: number;
    meaning_score: number | null;
    ai_score_before: number | null;
    ai_score_after: number | null;
    plagiarism_percent: number | null;
  };
}

export interface UsageResponse {
  words_used: number;
  words_limit: number;
  period: 'day' | 'month';
  reset_date: string;
  plan: PlanTier;
  plagiarism_scans_used: number;
  plagiarism_scans_limit: number;
}

// ---- Provider Interfaces ----
export interface LlmResult {
  text: string;
  tokens_used: number;
}

export interface DetectorResult {
  ai_percentage: number;
  flags: Array<{ sentence: string; score: number; label: string }>;
}

export interface PlagiarismResult {
  similarity_percentage: number;
  sources: Array<{ url: string; matched_text: string; percentage: number }>;
}

export interface EmbeddingResult {
  embedding: number[];
}
