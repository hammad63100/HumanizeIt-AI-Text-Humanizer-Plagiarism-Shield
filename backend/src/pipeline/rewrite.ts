import { config } from '../config';
import { Logger, countWords, cosineSimilarity } from '../utils';
import { llmProvider, detectorProvider, embeddingProvider } from '../providers';
import { DocumentRepo, JobRepo, ScanRepo, UsageRepo } from '../db/repositories';
import { protectEntities, restoreEntities, chunkText, cleanupText } from './entities';
import { buildRewritePrompt } from './prompts';
import { RewriteMode } from '../types';

export interface PipelineInput {
  jobId: string;
  userId: string | null;
  sessionId: string | null;
  text: string;
  mode: RewriteMode;
  tone?: string;
  voiceProfileId?: string;
}

export interface PipelineResult {
  documentId: string;
  rewrittenText: string;
  meaningScore: number | null;
  aiScoreBefore: number | null;
  aiScoreAfter: number | null;
}

/**
 * Execute the full 10-step rewrite pipeline.
 * This is the core worker logic that processes humanize jobs.
 */
export async function executeRewritePipeline(input: PipelineInput): Promise<PipelineResult> {
  const { jobId, userId, sessionId, text, mode, tone } = input;
  const wordCount = countWords(text);
  const effectiveUserId = userId || sessionId || 'anonymous';

  Logger.info('Pipeline started', { job_id: jobId, word_count: wordCount, mode });

  // Mark job as running
  await JobRepo.updateStatus(jobId, 'running');

  try {
    // ──────────────────────────────────────────
    // Step 1: Validate & Reserve
    // ──────────────────────────────────────────
    Logger.info('Step 1: Validate & Reserve', { job_id: jobId });

    if (userId) {
      await UsageRepo.addWords(userId, wordCount);
    }

    // ──────────────────────────────────────────
    // Step 2: Protect Entities
    // ──────────────────────────────────────────
    Logger.info('Step 2: Protect Entities', { job_id: jobId });
    const { protectedText, entities } = protectEntities(text);

    // ──────────────────────────────────────────
    // Step 3: Chunking
    // ──────────────────────────────────────────
    Logger.info('Step 3: Chunking', { job_id: jobId });
    const chunks = chunkText(
      protectedText,
      config.pipeline.chunkMinWords,
      config.pipeline.chunkMaxWords
    );

    // ──────────────────────────────────────────
    // Step 4: Style Analysis (baseline metrics)
    // ──────────────────────────────────────────
    Logger.info('Step 4: Style Analysis', { job_id: jobId });
    const avgSentenceLength = computeAvgSentenceLength(text);
    const passiveVoiceCount = countPassiveVoice(text);

    Logger.debug('Baseline metrics', {
      job_id: jobId,
      avg_sentence_length: avgSentenceLength,
      passive_voice_count: passiveVoiceCount,
      chunk_count: chunks.length,
    });

    // ──────────────────────────────────────────
    // Step 5: LLM Rewrite (per chunk)
    // ──────────────────────────────────────────
    Logger.info('Step 5: LLM Rewrite', { job_id: jobId, chunks: chunks.length });

    const rewrittenChunks: string[] = [];
    let totalTokens = 0;

    for (let i = 0; i < chunks.length; i++) {
      const { systemPrompt, userPrompt } = buildRewritePrompt(chunks[i], mode, tone);
      const result = await llmProvider.generate(userPrompt, {
        systemPrompt,
        temperature: mode === 'light' ? 0.3 : mode === 'balanced' ? 0.6 : 0.8,
      });

      rewrittenChunks.push(result.text);
      totalTokens += result.tokens_used;

      Logger.debug(`Chunk ${i + 1}/${chunks.length} rewritten`, {
        job_id: jobId,
        tokens: result.tokens_used,
      });
    }

    // ──────────────────────────────────────────
    // Step 6: Restore Entities
    // ──────────────────────────────────────────
    Logger.info('Step 6: Restore Entities', { job_id: jobId });
    let rewrittenText = rewrittenChunks.join('\n\n');
    rewrittenText = restoreEntities(rewrittenText, entities);

    // ──────────────────────────────────────────
    // Step 7: Clean Up
    // ──────────────────────────────────────────
    Logger.info('Step 7: Clean Up', { job_id: jobId });
    rewrittenText = cleanupText(rewrittenText);

    // ──────────────────────────────────────────
    // Step 8: Quality Gates
    // ──────────────────────────────────────────
    Logger.info('Step 8: Quality Gates', { job_id: jobId });

    // 8a. Meaning-Lock Gate
    let meaningScore: number | null = null;
    try {
      const [originalEmb, rewrittenEmb] = await Promise.all([
        embeddingProvider.embed(text),
        embeddingProvider.embed(rewrittenText),
      ]);
      meaningScore = cosineSimilarity(originalEmb.embedding, rewrittenEmb.embedding);
      meaningScore = Math.round(meaningScore * 100) / 100;

      Logger.info('Meaning-Lock score', { job_id: jobId, score: meaningScore });

      // If below threshold, retry with Light mode
      if (meaningScore < config.pipeline.meaningLockThreshold) {
        Logger.warn('Meaning-Lock below threshold, retrying with Light mode', {
          job_id: jobId,
          score: meaningScore,
          threshold: config.pipeline.meaningLockThreshold,
        });

        const { systemPrompt, userPrompt } = buildRewritePrompt(text, 'light', tone);
        const retryResult = await llmProvider.generate(userPrompt, {
          systemPrompt,
          temperature: 0.3,
        });
        rewrittenText = cleanupText(restoreEntities(retryResult.text, entities));

        // Recompute meaning score
        const retryEmb = await embeddingProvider.embed(rewrittenText);
        meaningScore = cosineSimilarity(originalEmb.embedding, retryEmb.embedding);
        meaningScore = Math.round(meaningScore * 100) / 100;
      }
    } catch (error: any) {
      Logger.warn('Meaning-Lock check failed (non-critical)', { error: error.message });
    }

    // 8b. AI Score Gate
    let aiScoreBefore: number | null = null;
    let aiScoreAfter: number | null = null;
    try {
      const [beforeResult, afterResult] = await Promise.all([
        detectorProvider.score(text),
        detectorProvider.score(rewrittenText),
      ]);
      aiScoreBefore = beforeResult.ai_percentage;
      aiScoreAfter = afterResult.ai_percentage;

      Logger.info('AI detection scores', {
        job_id: jobId,
        before: aiScoreBefore,
        after: aiScoreAfter,
      });

      // If AI score is still too high, execute alternate passes (max 2)
      let retryCount = 0;
      while (aiScoreAfter > 30 && retryCount < config.pipeline.maxAiScoreRetries) {
        retryCount++;
        Logger.info(`AI score retry pass ${retryCount}`, { job_id: jobId });

        const { systemPrompt, userPrompt } = buildRewritePrompt(rewrittenText, 'strong', tone);
        const retryResult = await llmProvider.generate(userPrompt, {
          systemPrompt: systemPrompt + '\n\nIMPORTANT: The text still reads as AI-generated. Focus on making it sound more natural and human-written.',
          temperature: 0.9,
        });
        rewrittenText = cleanupText(retryResult.text);

        const newScore = await detectorProvider.score(rewrittenText);
        aiScoreAfter = newScore.ai_percentage;
      }
    } catch (error: any) {
      Logger.warn('AI detection check failed (non-critical)', { error: error.message });
    }

    // ──────────────────────────────────────────
    // Step 9: Save Output
    // ──────────────────────────────────────────
    Logger.info('Step 9: Save Output', { job_id: jobId });

    const document = await DocumentRepo.create({
      user_id: userId,
      original_text: text,
      mode,
      tone,
      word_count: wordCount,
    });

    await DocumentRepo.updateResult(document.id, rewrittenText, meaningScore);

    await ScanRepo.create({
      document_id: document.id,
      ai_score_before: aiScoreBefore ?? undefined,
      ai_score_after: aiScoreAfter ?? undefined,
    });

    await JobRepo.setDocumentId(jobId, document.id);
    await JobRepo.updateStatus(jobId, 'done');

    // ──────────────────────────────────────────
    // Step 10: Settle Usage
    // ──────────────────────────────────────────
    Logger.info('Step 10: Settle Usage — job completed', {
      job_id: jobId,
      tokens_used: totalTokens,
      meaning_score: meaningScore,
    });

    return {
      documentId: document.id,
      rewrittenText,
      meaningScore,
      aiScoreBefore,
      aiScoreAfter,
    };

  } catch (error: any) {
    // On failure, release reserved quota
    Logger.error('Pipeline failed', { job_id: jobId, error: error.message });

    if (userId) {
      await UsageRepo.releaseWords(userId, wordCount).catch(() => {});
    }

    await JobRepo.updateStatus(jobId, 'failed', error.message);
    throw error;
  }
}

// ── Helper functions ──

function computeAvgSentenceLength(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  const totalWords = sentences.reduce((sum, s) => sum + countWords(s), 0);
  return Math.round(totalWords / sentences.length);
}

function countPassiveVoice(text: string): number {
  // Simple passive voice heuristic: "was/were/been/being + past participle"
  const passivePattern = /\b(?:was|were|been|being|is|are)\s+\w+(?:ed|en|t)\b/gi;
  const matches = text.match(passivePattern);
  return matches ? matches.length : 0;
}
