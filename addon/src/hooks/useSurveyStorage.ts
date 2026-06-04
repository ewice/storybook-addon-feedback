import { useState, useEffect, useCallback } from 'react';
import { SurveyResponses } from '../types';
import { STORAGE_KEYS } from '../constants';
import { safeStorage, StorageAdapter } from '../utils/storage';

export interface SurveyStorageState {
  isCompleted: boolean;
  isSkippedPermanently: boolean;
  dismissedAt: number | null;
  impressionCount: number;
  isSessionDismissed: boolean;
}

export const useSurveyStorage = (surveyId: string, storageAdapter: StorageAdapter = safeStorage) => {
  const completedKey = STORAGE_KEYS.completed(surveyId);
  const skippedPermanentlyKey = STORAGE_KEYS.skippedPermanently(surveyId);
  const dismissedAtKey = STORAGE_KEYS.dismissedAt(surveyId);
  const sessionDismissedKey = STORAGE_KEYS.sessionDismissed(surveyId);
  const impressionCountKey = STORAGE_KEYS.impressionCount(surveyId);
  const draftKey = STORAGE_KEYS.draft(surveyId);

  const [state, setState] = useState<SurveyStorageState>(() => {
    const isCompleted = storageAdapter.getItem(completedKey) === 'true';
    const isSkippedPermanently = storageAdapter.getItem(skippedPermanentlyKey) === 'true';
    const dismissed = storageAdapter.getItem(dismissedAtKey);
    const dismissedAt = dismissed ? Number(dismissed) : null;
    const impressionCount = parseInt(storageAdapter.getItem(impressionCountKey) || '0', 10);
    const isSessionDismissed = storageAdapter.getItem(sessionDismissedKey, true) === 'true';

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
    const isCompleted = storageAdapter.getItem(completedKey) === 'true';
    const isSkippedPermanently = storageAdapter.getItem(skippedPermanentlyKey) === 'true';
    const dismissed = storageAdapter.getItem(dismissedAtKey);
    const dismissedAt = dismissed ? Number(dismissed) : null;
    const impressionCount = parseInt(storageAdapter.getItem(impressionCountKey) || '0', 10);
    const isSessionDismissed = storageAdapter.getItem(sessionDismissedKey, true) === 'true';

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
    sessionDismissedKey,
    storageAdapter
  ]);

  // Synchronize state across browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === completedKey) {
        setState((prev) => ({ ...prev, isCompleted: e.newValue === 'true' }));
      }
      if (e.key === skippedPermanentlyKey) {
        setState((prev) => ({ ...prev, isSkippedPermanently: e.newValue === 'true' }));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [completedKey, skippedPermanentlyKey]);

  const setCompleted = useCallback(() => {
    storageAdapter.setItem(completedKey, 'true');
    setState((prev) => ({ ...prev, isCompleted: true }));
  }, [completedKey, storageAdapter]);

  const setSkippedPermanently = useCallback(() => {
    storageAdapter.setItem(skippedPermanentlyKey, 'true');
    setState((prev) => ({ ...prev, isSkippedPermanently: true }));
  }, [skippedPermanentlyKey, storageAdapter]);

  const setDismissed = useCallback(
    (timestamp: number) => {
      storageAdapter.setItem(dismissedAtKey, String(timestamp));
      storageAdapter.setItem(sessionDismissedKey, 'true', true);
      setState((prev) => ({ ...prev, dismissedAt: timestamp, isSessionDismissed: true }));
    },
    [dismissedAtKey, sessionDismissedKey, storageAdapter]
  );

  const incrementImpressions = useCallback(() => {
    const current = parseInt(storageAdapter.getItem(impressionCountKey) || '0', 10);
    const nextCount = current + 1;
    storageAdapter.setItem(impressionCountKey, String(nextCount));
    setState((prev) => ({ ...prev, impressionCount: nextCount }));
    return nextCount;
  }, [impressionCountKey, storageAdapter]);

  const getDraft = useCallback((): SurveyResponses => {
    const draft = storageAdapter.getItem(draftKey, true);
    if (!draft) return {};
    try {
      return JSON.parse(draft);
    } catch {
      return {};
    }
  }, [draftKey, storageAdapter]);

  const saveDraft = useCallback(
    (values: SurveyResponses) => {
      storageAdapter.setItem(draftKey, JSON.stringify(values), true);
    },
    [draftKey, storageAdapter]
  );

  const clearDraft = useCallback(() => {
    storageAdapter.removeItem(draftKey, true);
  }, [draftKey, storageAdapter]);

  return {
    state: {
      isCompleted: state.isCompleted,
      isSkippedPermanently: state.isSkippedPermanently,
      dismissedAt: state.dismissedAt,
      impressionCount: state.impressionCount,
      isSessionDismissed: state.isSessionDismissed,
    },
    actions: {
      complete: setCompleted,
      skipPermanently: setSkippedPermanently,
      dismiss: setDismissed,
      recordImpression: incrementImpressions,
    },
    draft: {
      get: getDraft,
      save: saveDraft,
      clear: clearDraft,
    },
  };
};

export type SurveyStorage = ReturnType<typeof useSurveyStorage>;
