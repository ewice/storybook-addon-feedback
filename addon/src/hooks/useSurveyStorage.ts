import { useState, useEffect, useCallback } from 'react';

export interface SurveyStorageState {
  isCompleted: boolean;
  isSkippedPermanently: boolean;
  dismissedAt: number | null;
  impressionCount: number;
}

export const useSurveyStorage = (surveyId: string) => {
  const completedKey = `sb-survey-completed-${surveyId}`;
  const skippedPermanentlyKey = `sb-survey-skipped-${surveyId}`;
  const dismissedAtKey = `sb-survey-dismissed-at-${surveyId}`;
  const impressionCountKey = `sb-survey-impressions-${surveyId}`;
  const draftKey = `sb-survey-draft-${surveyId}`;

  const [state, setState] = useState<SurveyStorageState>(() => {
    // Perform initial read synchronously to avoid flash of incorrect UI
    try {
      const isCompleted = localStorage.getItem(completedKey) === 'true';
      const isSkippedPermanently = localStorage.getItem(skippedPermanentlyKey) === 'true';
      const dismissed = localStorage.getItem(dismissedAtKey);
      const dismissedAt = dismissed ? Number(dismissed) : null;
      const impressionCount = parseInt(localStorage.getItem(impressionCountKey) || '0', 10);

      return {
        isCompleted,
        isSkippedPermanently,
        dismissedAt,
        impressionCount,
      };
    } catch (e) {
      return {
        isCompleted: false,
        isSkippedPermanently: false,
        dismissedAt: null,
        impressionCount: 0,
      };
    }
  });

  // Keep state in sync if surveyId changes dynamically
  useEffect(() => {
    try {
      const isCompleted = localStorage.getItem(completedKey) === 'true';
      const isSkippedPermanently = localStorage.getItem(skippedPermanentlyKey) === 'true';
      const dismissed = localStorage.getItem(dismissedAtKey);
      const dismissedAt = dismissed ? Number(dismissed) : null;
      const impressionCount = parseInt(localStorage.getItem(impressionCountKey) || '0', 10);

      setState({
        isCompleted,
        isSkippedPermanently,
        dismissedAt,
        impressionCount,
      });
    } catch (e) {
      // Fallback
    }
  }, [completedKey, skippedPermanentlyKey, dismissedAtKey, impressionCountKey]);

  const setCompleted = useCallback(() => {
    try {
      localStorage.setItem(completedKey, 'true');
      setState((prev) => ({ ...prev, isCompleted: true }));
    } catch (e) {
      console.error('[Feedback Survey Storage] Failed to set completed state:', e);
    }
  }, [completedKey]);

  const setSkippedPermanently = useCallback(() => {
    try {
      localStorage.setItem(skippedPermanentlyKey, 'true');
      setState((prev) => ({ ...prev, isSkippedPermanently: true }));
    } catch (e) {
      console.error('[Feedback Survey Storage] Failed to set skippedPermanently state:', e);
    }
  }, [skippedPermanentlyKey]);

  const setDismissed = useCallback((timestamp: number) => {
    try {
      localStorage.setItem(dismissedAtKey, String(timestamp));
      setState((prev) => ({ ...prev, dismissedAt: timestamp }));
    } catch (e) {
      console.error('[Feedback Survey Storage] Failed to set dismissed state:', e);
    }
  }, [dismissedAtKey]);

  const incrementImpressions = useCallback(() => {
    let nextCount = 0;
    try {
      const current = parseInt(localStorage.getItem(impressionCountKey) || '0', 10);
      nextCount = current + 1;
      localStorage.setItem(impressionCountKey, String(nextCount));
      setState((prev) => ({ ...prev, impressionCount: nextCount }));
    } catch (e) {
      console.error('[Feedback Survey Storage] Failed to increment impression count:', e);
    }
    return nextCount;
  }, [impressionCountKey]);

  // Session draft helpers
  const getDraft = useCallback((): Record<string, any> => {
    try {
      const draft = sessionStorage.getItem(draftKey);
      return draft ? JSON.parse(draft) : {};
    } catch (e) {
      return {};
    }
  }, [draftKey]);

  const saveDraft = useCallback((values: Record<string, any>) => {
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(values));
    } catch (e) {
      console.error('[Feedback Survey Storage] Failed to save draft values:', e);
    }
  }, [draftKey]);

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(draftKey);
    } catch (e) {
      console.error('[Feedback Survey Storage] Failed to clear draft values:', e);
    }
  }, [draftKey]);

  return {
    ...state,
    setCompleted,
    setSkippedPermanently,
    setDismissed,
    incrementImpressions,
    getDraft,
    saveDraft,
    clearDraft,
  };
};
