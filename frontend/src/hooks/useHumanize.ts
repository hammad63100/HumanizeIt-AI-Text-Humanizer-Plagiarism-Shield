import { useState, useCallback } from 'react';
import { useToolStore } from '@/store/toolStore';
import { apiClient } from '@/lib/api-client';
import { countWords } from '@/lib/utils';
import { checkWordLimit } from '@/lib/limits';
import { trackEvent } from '@/lib/analytics';

export function useHumanize() {
  const {
    inputText,
    mode,
    tone,
    userPlan,
    activeVoiceProfileId,
    setIsHumanizing,
    setJobProgress,
    setOutputText,
    setCurrentJob,
    setUpgradeModalOpen,
  } = useToolStore();

  const [error, setError] = useState<string | null>(null);

  const startHumanize = useCallback(async () => {
    const wordCount = countWords(inputText);
    if (wordCount === 0) {
      setError("Please paste or type some text first.");
      return;
    }

    const limitCheck = checkWordLimit(wordCount, userPlan);
    if (limitCheck.isOver) {
      setUpgradeModalOpen(true);
      setError(`Text is ${wordCount} words. Your current plan allows up to ${limitCheck.max} words per request.`);
      return;
    }

    setError(null);
    setIsHumanizing(true);
    setJobProgress(15);

    trackEvent('humanize_started', {
      word_count: wordCount,
      mode,
      tone,
      plan: userPlan,
    });

    try {
      const { job_id } = await apiClient.startHumanize({
        text: inputText,
        mode,
        tone,
        voice_profile_id: activeVoiceProfileId,
      });

      setJobProgress(35);

      // Poll every 1 second until done or failed
      const pollInterval = 1000;
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max timeout

      const poll = async () => {
        try {
          attempts++;
          const job = await apiClient.getJob(job_id);

          if (job.status === 'done') {
            setJobProgress(100);
            setOutputText(job.rewritten_text);
            setCurrentJob(job);
            setIsHumanizing(false);

            trackEvent('humanize_completed', {
              word_count: wordCount,
              ai_before: job.ai_score_before,
              ai_after: job.ai_score_after,
              meaning_score: job.meaning_score,
            });
            return;
          }

          if (job.status === 'failed') {
            setIsHumanizing(false);
            setError(job.error || "Humanization failed. Word quota was not charged.");
            trackEvent('humanize_failed', { reason: job.error });
            return;
          }

          // In progress: advance visual progress
          const progressStep = Math.min(90, 35 + attempts * 15);
          setJobProgress(progressStep);

          if (attempts < maxAttempts) {
            setTimeout(poll, pollInterval);
          } else {
            setIsHumanizing(false);
            setError("Request timed out. Please try again.");
          }
        } catch (pollErr: any) {
          setIsHumanizing(false);
          setError(pollErr?.message || "Error polling job status.");
        }
      };

      setTimeout(poll, pollInterval);
    } catch (err: any) {
      setIsHumanizing(false);
      setError(err?.message || "Failed to start humanize job.");
      if (err?.message?.includes("Payment") || err?.message?.includes("limit")) {
        setUpgradeModalOpen(true);
      }
    }
  }, [
    inputText,
    mode,
    tone,
    userPlan,
    activeVoiceProfileId,
    setIsHumanizing,
    setJobProgress,
    setOutputText,
    setCurrentJob,
    setUpgradeModalOpen,
  ]);

  return {
    startHumanize,
    error,
    clearError: () => setError(null),
  };
}
