import { config } from '../config';
import { Logger } from '../utils';
import { DetectorResult } from '../types';

/**
 * AI Detector Provider Adapter.
 * Analyzes text and returns an AI probability score with sentence-level flags.
 */
export class DetectorProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = config.detector.apiKey;
  }

  /**
   * Score text for AI detection probability.
   */
  async score(text: string): Promise<DetectorResult> {
    if (!this.apiKey || this.apiKey === 'your_detector_api_key') {
      Logger.warn('Detector API key not configured — returning simulated score');
      return this.simulateScore(text);
    }

    try {
      // Generic detector API call — replace with actual vendor endpoint
      const response = await fetch('https://api.detector-service.com/v1/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Detector API error: ${response.status}`);
      }

      const data = await response.json() as any;

      return {
        ai_percentage: data.ai_percentage || data.score || 0,
        flags: data.flags || data.sentences || [],
      };
    } catch (error: any) {
      Logger.error('Detector API call failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Simulated AI detection for development.
   */
  private simulateScore(text: string): DetectorResult {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const flags = sentences.map((sentence, i) => {
      // Simulate varying AI scores per sentence
      const score = Math.random() * 0.6 + 0.2;
      return {
        sentence: sentence.trim(),
        score: Math.round(score * 100) / 100,
        label: score > 0.7 ? 'likely_ai' : score > 0.4 ? 'mixed' : 'likely_human',
      };
    });

    const avgScore = flags.reduce((sum, f) => sum + f.score, 0) / (flags.length || 1);

    return {
      ai_percentage: Math.round(avgScore * 100),
      flags,
    };
  }
}

export const detectorProvider = new DetectorProvider();
