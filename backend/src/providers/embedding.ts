import { config } from '../config';
import { Logger } from '../utils';
import { EmbeddingResult } from '../types';

/**
 * Embedding Provider Adapter.
 * Generates vector embeddings for text to compute the Meaning-Lock similarity score.
 */
export class EmbeddingProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = config.embedding.apiKey;
  }

  /**
   * Generate embedding vector for a text string.
   */
  async embed(text: string): Promise<EmbeddingResult> {
    if (!this.apiKey || this.apiKey === 'your_embedding_api_key') {
      Logger.warn('Embedding API key not configured — returning simulated embedding');
      return this.simulateEmbedding(text);
    }

    try {
      // OpenAI embeddings API
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return { embedding: data.data[0].embedding };
    } catch (error: any) {
      Logger.error('Embedding API call failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Simulated embedding for development.
   * Creates a deterministic pseudo-embedding based on text content.
   */
  private simulateEmbedding(text: string): EmbeddingResult {
    const dimensions = 128;
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(dimensions).fill(0.85);

    for (const word of words) {
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = ((hash << 5) - hash + word.charCodeAt(j)) | 0;
      }
      const idx = Math.abs(hash) % dimensions;
      embedding[idx] += 0.15;
    }

    const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return {
      embedding: embedding.map((v) => v / (norm || 1)),
    };
  }
}

export const embeddingProvider = new EmbeddingProvider();
