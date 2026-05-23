import { useState, useEffect, useCallback } from 'react';

export interface SurveyStorageState {
  isCompleted: boolean;
  isSkippedPermanently: boolean;
  dismissedAt: number | null;
  impressionCount: number;
  isSessionDismissed: boolean;
}

const safeStorage = {
  getItem(key: string, isSession = false): string | null {
    try {
      return isSession ? sessionStorage.getItem(key) : localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string, isSession = false): void {
    try {
      if (isSession) {
        sessionStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, value);
      }
    } catch {
      // Graceful fallback if storage is blocked
    }
  },
  removeItem(key: string, isSession = false): void {
    try {
      if (isSession) {
        sessionStorage.removeItem(key);
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      // Graceful fallback if storage is blocked
    }
  }
};

export const useSurveyStorage = (surveyId: string) => {
  const completedKey = `sb-survey-completed-${surveyId}`;
  const skippedPermanentlyKey = `sb-survey-skipped-${surveyId}`;
  const dismissedAtKey = `sb-survey-dismissed-at-${surveyId}`;
  const sessionDismissedKey = `sb-survey-session-dismissed-${surveyId}`;
  const impressionCountKey = `sb-survey-impressions-${surveyId}`;
  const draftKey = `sb-survey-draft-${surveyId}`;

  const [state, setState] = useState<SurveyStorageState>(() => {
    const isCompleted = safeStorage.getItem(completedKey) === 'true';
    const isSkippedPermanently = safeStorage.getItem(skippedPermanentlyKey) === 'true';
    const dismissed = safeStorage.getItem(dismissedAtKey);
    const dismissedAt = dismissed ? Number(dismissed) : null;
    const impressionCount = parseInt(safeStorage.getItem(impressionCountKey) || '0', 10);
    const isSessionDismissed = safeStorage.getItem(sessionDismissedKey, true) === 'true';

    return {
      isCompleted,
      isSkippedPermanently,
      dismissedAt,
      impressionCount,
      isSessionDismissed
    };
  });

  // Keep state in sync if surveyId changes dynamically
  useEffect(() => {
    const isCompleted = safeStorage.getItem(completedKey) === 'true';
    const isSkippedPermanently = safeStorage.getItem(skippedPermanentlyKey) === 'true';
    const dismissed = safeStorage.getItem(dismissedAtKey);
    const dismissedAt = dismissed ? Number(dismissed) : null;
    const impressionCount = parseInt(safeStorage.getItem(impressionCountKey) || '0', 10);
    const isSessionDismissed = safeStorage.getItem(sessionDismissedKey, true) === 'true';

    setState({
      isCompleted,
      isSkippedPermanently,
      dismissedAt,
      impressionCount,
      isSessionDismissed
    });
  }, [
    completedKey,
    skippedPermanentlyKey,
    dismissedAtKey,
    impressionCountKey,
    sessionDismissedKey
  ]);

  const setCompleted = useCallback(() => {
    safeStorage.setItem(completedKey, 'true');
    setState((prev) => ({ ...prev, isCompleted: true }));
  }, [completedKey]);

  const setSkippedPermanently = useCallback(() => {
    safeStorage.setItem(skippedPermanentlyKey, 'true');
    setState((prev) => ({ ...prev, isSkippedPermanently: true }));
  }, [skippedPermanentlyKey]);

  const setDismissed = useCallback(
    (timestamp: number) => {
      safeStorage.setItem(dismissedAtKey, String(timestamp));
      safeStorage.setItem(sessionDismissedKey, 'true', true);
      setState((prev) => ({ ...prev, dismissedAt: timestamp, isSessionDismissed: true }));
    },
    [dismissedAtKey, sessionDismissedKey]
  );

  const incrementImpressions = useCallback(() => {
    const current = parseInt(safeStorage.getItem(impressionCountKey) || '0', 10);
    const nextCount = current + 1;
    safeStorage.setItem(impressionCountKey, String(nextCount));
    setState((prev) => ({ ...prev, impressionCount: nextCount }));
    return nextCount;
  }, [impressionCountKey]);

  const getDraft = useCallback((): Record<string, any> => {
    const draft = safeStorage.getItem(draftKey, true);
    if (!draft) return {};
    try {
      return JSON.parse(draft);
    } catch {
      return {};
    }
  }, [draftKey]);

  const saveDraft = useCallback(
    (values: Record<string, any>) => {
      safeStorage.setItem(draftKey, JSON.stringify(values), true);
    },
    [draftKey]
  );

  const clearDraft = useCallback(() => {
    safeStorage.removeItem(draftKey, true);
  }, [draftKey]);

  return {
    ...state,
    setCompleted,
    setSkippedPermanently,
    setDismissed,
    incrementImpressions,
    getDraft,
    saveDraft,
    clearDraft
  };
};
