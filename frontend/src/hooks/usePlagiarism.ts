import { useState, useCallback } from 'react';
import { useToolStore } from '@/store/toolStore';
import { apiClient } from '@/lib/api-client';
import { trackEvent } from '@/lib/analytics';
import { countWords } from '@/lib/utils';

export function usePlagiarism() {
  const {
    outputText,
    inputText,
    setIsCheckingPlagiarism,
    setPlagiarismResult,
    setActiveTab,
    setUpgradeModalOpen,
  } = useToolStore();

  const [error, setError] = useState<string | null>(null);

  const checkPlagiarism = useCallback(async () => {
    // Check against output text if available, otherwise check input text
    const textToCheck = outputText.trim() ? outputText : inputText;
    const wordCount = countWords(textToCheck);

    if (wordCount < 15) {
      setError("Please provide at least 15 words to scan for plagiarism.");
      return;
    }

    setError(null);
    setIsCheckingPlagiarism(true);

    trackEvent('plagiarism_check_started', {
      word_count: wordCount,
      target: outputText.trim() ? 'output' : 'input',
    });

    try {
      const result = await apiClient.checkPlagiarism(textToCheck);
      setPlagiarismResult(result);
      setIsCheckingPlagiarism(false);
      setActiveTab('plagiarism');

      trackEvent('plagiarism_check_completed', {
        similarity_score: result.similarity_score,
        sources_found: result.sources.length,
      });
    } catch (err: any) {
      setIsCheckingPlagiarism(false);
      setError(err?.message || "Failed to scan plagiarism.");
      if (err?.message?.includes("limit") || err?.message?.includes("Payment")) {
        setUpgradeModalOpen(true);
      }
    }
  }, [
    outputText,
    inputText,
    setIsCheckingPlagiarism,
    setPlagiarismResult,
    setActiveTab,
    setUpgradeModalOpen,
  ]);

  return {
    checkPlagiarism,
    error,
    clearError: () => setError(null),
  };
}
