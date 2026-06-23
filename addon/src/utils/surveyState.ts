import type { StorageAdapter } from './storage';
import { STORAGE_KEYS } from '../constants';

export interface SurveyStorageState {
  isCompleted: boolean;
  isSkippedPermanently: boolean;
  dismissedAt: number | null;
  impressionCount: number;
  isSessionDismissed: boolean;
}

export const parseBooleanFlag = (raw: string | null): boolean => raw === 'true';

export const parseDismissedAt = (raw: string | null): number | null => {
  if (raw === null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

export const parseImpressionCount = (raw: string | null): number => {
  if (raw === null || raw === '') return 0;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : 0;
};

export const readSurveyState = (adapter: StorageAdapter, surveyId: string): SurveyStorageState => ({
  isCompleted: parseBooleanFlag(adapter.getItem(STORAGE_KEYS.completed(surveyId))),
  isSkippedPermanently: parseBooleanFlag(
    adapter.getItem(STORAGE_KEYS.skippedPermanently(surveyId))
  ),
  dismissedAt: parseDismissedAt(adapter.getItem(STORAGE_KEYS.dismissedAt(surveyId))),
  impressionCount: parseImpressionCount(adapter.getItem(STORAGE_KEYS.impressionCount(surveyId))),
  isSessionDismissed: parseBooleanFlag(
    adapter.getItem(STORAGE_KEYS.sessionDismissed(surveyId), true)
  )
});
