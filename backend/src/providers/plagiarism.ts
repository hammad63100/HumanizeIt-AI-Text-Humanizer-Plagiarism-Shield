import { config } from '../config';
import { Logger } from '../utils';
import { PlagiarismResult } from '../types';

/**
 * Plagiarism Detection Provider Adapter.
 * Scans text for plagiarism and returns similarity percentage with source matches.
 */
export class PlagiarismProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = config.plagiarism.apiKey;
  }

  /**
   * Scan text for plagiarism.
   */
  async scan(text: string): Promise<PlagiarismResult> {
    if (!this.apiKey || this.apiKey === 'your_plagiarism_api_key') {
      Logger.warn('Plagiarism API key not configured — returning simulated result');
      return this.simulateScan(text);
    }

    try {
      const response = await fetch('https://api.plagiarism-service.com/v1/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Plagiarism API error: ${response.status}`);
      }

      const data = await response.json() as any;

      return {
        similarity_percentage: data.similarity_percentage || data.score || 0,
        sources: data.sources || [],
      };
    } catch (error: any) {
      Logger.error('Plagiarism API call failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Simulated plagiarism check for development.
   */
  private simulateScan(text: string): PlagiarismResult {
    const wordCount = text.split(/\s+/).length;
    const similarity = Math.max(0, Math.min(15, Math.random() * 20));

    return {
      similarity_percentage: Math.round(similarity * 10) / 10,
      sources: similarity > 5
        ? [
            {
              url: 'https://example.com/sample-article',
              matched_text: text.substring(0, Math.min(100, text.length)),
              percentage: Math.round(similarity * 0.6 * 10) / 10,
            },
          ]
        : [],
    };
  }
}

export const plagiarismProvider = new PlagiarismProvider();
