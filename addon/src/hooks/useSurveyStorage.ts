import { useState, useEffect, useCallback } from 'react';
import type { SurveyField, SurveyResponses } from '../types';
import { STORAGE_KEYS } from '../constants';
import { sanitizeDraft } from '../utils/draft';
import { safeStorage, type StorageAdapter } from '../utils/storage';
import {
  readSurveyState,
  parseBooleanFlag,
  parseDismissedAt,
  parseImpressionCount,
  type SurveyStorageState
} from '../utils/surveyState';

export type { SurveyStorageState };

export const useSurveyStorage = (
  surveyId: string,
  storageAdapter: StorageAdapter = safeStorage,
  questions: SurveyField[] = []
) => {
  const completedKey = STORAGE_KEYS.completed(surveyId);
  const skippedPermanentlyKey = STORAGE_KEYS.skippedPermanently(surveyId);
  const dismissedAtKey = STORAGE_KEYS.dismissedAt(surveyId);
  const sessionDismissedKey = STORAGE_KEYS.sessionDismissed(surveyId);
  const impressionCountKey = STORAGE_KEYS.impressionCount(surveyId);
  const draftKey = STORAGE_KEYS.draft(surveyId);

  const [state, setState] = useState<SurveyStorageState>(() =>
    readSurveyState(storageAdapter, surveyId)
  );

  useEffect(() => {
    setState(readSurveyState(storageAdapter, surveyId));
  }, [
    completedKey,
    skippedPermanentlyKey,
    dismissedAtKey,
    impressionCountKey,
    sessionDismissedKey,
    storageAdapter,
    surveyId
  ]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === completedKey) {
        setState((prev) => ({ ...prev, isCompleted: parseBooleanFlag(e.newValue) }));
      } else if (e.key === skippedPermanentlyKey) {
        setState((prev) => ({ ...prev, isSkippedPermanently: parseBooleanFlag(e.newValue) }));
      } else if (e.key === dismissedAtKey) {
        setState((prev) => ({ ...prev, dismissedAt: parseDismissedAt(e.newValue) }));
      } else if (e.key === impressionCountKey) {
        setState((prev) => ({ ...prev, impressionCount: parseImpressionCount(e.newValue) }));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [completedKey, skippedPermanentlyKey, dismissedAtKey, impressionCountKey]);

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
    const raw = storageAdapter.getItem(draftKey, true);
    return sanitizeDraft(raw, questions);
  }, [draftKey, storageAdapter, questions]);

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
      isSessionDismissed: state.isSessionDismissed
    },
    actions: {
      complete: setCompleted,
      skipPermanently: setSkippedPermanently,
      dismiss: setDismissed,
      recordImpression: incrementImpressions
    },
    draft: {
      get: getDraft,
      save: saveDraft,
      clear: clearDraft
    }
  };
};

export type SurveyStorage = ReturnType<typeof useSurveyStorage>;
