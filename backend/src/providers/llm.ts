import { config } from '../config';
import { Logger, sleep } from '../utils';
import { LlmResult } from '../types';

/**
 * LLM Provider Adapter.
 * Abstracts LLM API calls behind a modular interface for vendor portability.
 * Currently supports Anthropic Claude API, easily switchable to OpenAI.
 */
export class LlmProvider {
  private apiKey: string;
  private model: string;
  private timeoutMs: number;
  private maxRetries: number;

  constructor() {
    this.apiKey = config.llm.apiKey;
    this.model = config.llm.model;
    this.timeoutMs = config.pipeline.llmTimeoutMs;
    this.maxRetries = config.pipeline.llmMaxRetries;
  }

  /**
   * Generate text using the LLM.
   * Implements exponential backoff retry logic.
   */
  async generate(prompt: string, settings: {
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}): Promise<LlmResult> {
    const {
      systemPrompt = '',
      maxTokens = 4096,
      temperature = 0.7,
    } = settings;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const backoff = Math.pow(2, attempt) * 1000;
          Logger.info(`LLM retry attempt ${attempt}, waiting ${backoff}ms`);
          await sleep(backoff);
        }

        const result = await this.callApi(prompt, systemPrompt, maxTokens, temperature);

        Logger.info('LLM generation completed', {
          model: this.model,
          tokens_used: result.tokens_used,
          attempt,
        });

        return result;
      } catch (error: any) {
        lastError = error;
        Logger.warn(`LLM call failed (attempt ${attempt + 1}/${this.maxRetries + 1})`, {
          error: error.message,
        });
      }
    }

    throw new Error(`LLM generation failed after ${this.maxRetries + 1} attempts: ${lastError?.message}`);
  }

  /**
   * Internal API call to the LLM vendor.
   * Uses dynamic import for fetch in Node.js environments.
   */
  private async callApi(
    prompt: string,
    systemPrompt: string,
    maxTokens: number,
    temperature: number
  ): Promise<LlmResult> {
    // If no API key is configured, return a simulated response for development
    if (!this.apiKey || this.apiKey === 'your_llm_api_key') {
      Logger.warn('LLM API key not configured — returning simulated response');
      return this.simulateResponse(prompt);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      // Anthropic Claude API format
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`LLM API error ${response.status}: ${errorBody}`);
      }

      const data = await response.json() as any;
      const textContent = data.content?.[0]?.text || '';
      const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

      return { text: textContent, tokens_used: tokensUsed };
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Simulate an LLM response for development/testing without a real API key.
   */
  private simulateResponse(prompt: string): LlmResult {
    let sourceText = prompt.trim();
    const prefix = 'Please rewrite the following text:\n\n';
    if (prompt.includes(prefix)) {
      sourceText = prompt.substring(prompt.indexOf(prefix) + prefix.length).trim();
    } else if (prompt.includes('Rewrite this sentence:\n"""')) {
      const match = prompt.match(/Rewrite this sentence:\n"""([\s\S]*?)"""/);
      if (match) sourceText = match[1].trim();
    } else if (prompt.includes('Return ONLY the formatted citation')) {
      return {
        text: 'Vaswani, A., et al. (2017). Attention is all you need. Advances in Neural Information Processing Systems, 30, 5998–6008.',
        tokens_used: 45,
      };
    }

    const sentences = sourceText.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [sourceText];

    const humanized = sentences.map((sentence, idx) => {
      let clean = sentence.trim();

      const replacements: [RegExp, string][] = [
        [/in today's fast-paced digital era,?\s*/gi, 'Today, '],
        [/it is of paramount importance to\s*/gi, 'we really need to '],
        [/furthermore,?\s*/gi, idx % 2 === 0 ? 'Also, ' : 'On top of that, '],
        [/moreover,?\s*/gi, "What's more, "],
        [/in conclusion,?\s*/gi, 'Overall, '],
        [/delve into\s*/gi, 'explore '],
        [/systematically utilize\s*/gi, 'use '],
        [/comprehensive methodologies\s*/gi, 'practical methods '],
        [/drive unprecedented innovation\s*/gi, 'make real progress '],
        [/maximize cross-functional synergies\s*/gi, 'bring teams together '],
        [/across diverse paradigms\s*/gi, 'across the board '],
        [/inherently present substantial opportunities for\s*/gi, 'makes it much easier to '],
        [/streamlining administrative redundancies\s*/gi, 'cut through routine busywork '],
        [/proactively optimize\s*/gi, 'improve '],
        [/optimal efficacy\s*/gi, 'the best results '],
        [/meticulously analyzed\s*/gi, 'carefully examined '],
        [/comprehensive datasets\s*/gi, 'large sets of data '],
        [/superior predictive outcomes\s*/gi, 'much more accurate results '],
        [/multiple operational parameters\s*/gi, 'key business metrics '],
      ];

      for (const [pattern, rep] of replacements) {
        clean = clean.replace(pattern, rep);
      }

      if (clean.length > 0) {
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      }
      return clean;
    });

    const resultText = humanized.join(' ');
    const tokenCount = Math.ceil(resultText.split(/\s+/).length * 1.3);

    return {
      text: resultText,
      tokens_used: tokenCount,
    };
  }
}

// Singleton instance
export const llmProvider = new LlmProvider();
