import { 
  HumanizeJobResult, 
  PlagiarismResult, 
  RewriteMode, 
  RewriteTone, 
  UsageQuota, 
  DocumentHistoryItem,
  CitationResult,
  VoiceProfile
} from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `API Error ${response.status}`;
      try {
        const data = await response.json();
        errorMsg = data.error?.message || data.detail || data.message || errorMsg;
      } catch {
        // use default error message
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // Humanize rewrite job creation
  async startHumanize(params: {
    text: string;
    mode: RewriteMode;
    tone: RewriteTone;
    voice_profile_id?: string;
  }): Promise<{ job_id: string }> {
    return this.request<{ job_id: string }>("/v1/humanize", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // Poll rewrite job status
  async getJob(id: string): Promise<HumanizeJobResult> {
    return this.request<HumanizeJobResult>(`/v1/jobs/${id}`);
  }

  // Standalone AI likelihood detection
  async detectAI(text: string): Promise<{
    ai_score: number;
    sentence_scores: { sentence: string; ai_probability: number; flagged: boolean }[];
  }> {
    return this.request("/v1/detect", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  // Deep plagiarism similarity check
  async checkPlagiarism(text: string): Promise<PlagiarismResult> {
    return this.request<PlagiarismResult>("/v1/plagiarism", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  // Single sentence rewrite
  async rewriteSentence(params: {
    sentence: string;
    context_before?: string;
    context_after?: string;
    tone: RewriteTone;
  }): Promise<{ rewritten_sentence: string; ai_score: number }> {
    return this.request("/v1/rewrite-sentence", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // Generate citation helper
  async generateCitation(params: {
    source_url_or_title: string;
    style: "APA" | "MLA" | "Chicago";
  }): Promise<CitationResult> {
    return this.request<CitationResult>("/v1/citations", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // User word usage and limits
  async getUsage(): Promise<UsageQuota> {
    return this.request<UsageQuota>("/v1/usage");
  }

  // Saved document history
  async getDocuments(): Promise<DocumentHistoryItem[]> {
    return this.request<DocumentHistoryItem[]>("/v1/documents");
  }

  async deleteDocument(id: string): Promise<{ success: boolean }> {
    return this.request(`/v1/documents/${id}`, {
      method: "DELETE",
    });
  }

  // Voice Match profiles
  async getVoiceProfiles(): Promise<VoiceProfile[]> {
    return this.request<VoiceProfile[]>("/v1/voice-profile");
  }

  async createVoiceProfile(params: {
    name: string;
    sample_text: string;
  }): Promise<VoiceProfile> {
    return this.request<VoiceProfile>("/v1/voice-profile", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }
}

export const apiClient = new ApiClient();
