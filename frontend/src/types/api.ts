export type RewriteMode = 'light' | 'balanced' | 'strong';

export type RewriteTone = 'casual' | 'professional' | 'academic' | 'friendly' | 'blog';

export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

export interface SentenceScore {
  sentence: string;
  ai_probability: number; // 0 to 1
  flagged: boolean;
}

export interface PlagiarismSource {
  title: string;
  url: string;
  match_percentage: number;
  matched_text: string;
}

export interface PlagiarismResult {
  similarity_score: number; // 0 to 100
  sources: PlagiarismSource[];
  flagged_segments: string[];
}

export interface HumanizeJobResult {
  id: string;
  original_text: string;
  rewritten_text: string;
  mode: RewriteMode;
  tone: RewriteTone;
  word_count: number;
  meaning_score: number; // 0 to 100
  ai_score_before: number; // 0 to 100
  ai_score_after: number; // 0 to 100
  sentence_scores: SentenceScore[];
  status: JobStatus;
  created_at: string;
  finished_at?: string;
  error?: string;
}

export interface UsageQuota {
  plan: 'free' | 'pro' | 'premium' | 'team';
  words_used_today: number;
  daily_limit: number;
  max_words_per_request: number;
  voice_profiles_count: number;
  voice_profiles_limit: number;
  resets_at: string;
}

export interface DocumentHistoryItem {
  id: string;
  created_at: string;
  mode: RewriteMode;
  tone: RewriteTone;
  word_count: number;
  original_preview: string;
  rewritten_preview: string;
  ai_score_before: number;
  ai_score_after: number;
  meaning_score: number;
}

export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  created_at: string;
  sample_count: number;
  avg_sentence_length: number;
  vocabulary_level: string;
}

export interface CitationResult {
  format: 'APA' | 'MLA' | 'Chicago';
  citation: string;
}
