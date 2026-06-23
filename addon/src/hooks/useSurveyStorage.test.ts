import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vite-plus/test';
import { createMemoryStorage, type StorageAdapter } from '../utils/storage';
import { useSurveyStorage } from './useSurveyStorage';

describe('useSurveyStorage', () => {
  it('should initialize state correctly from storage adapter', () => {
    const memoryStorage = createMemoryStorage();
    const surveyId = 'test-survey-1';

    const { result } = renderHook(() => useSurveyStorage(surveyId, memoryStorage));

    expect(result.current.state.isCompleted).toBe(false);
    expect(result.current.state.isSkippedPermanently).toBe(false);
    expect(result.current.state.dismissedAt).toBeNull();
    expect(result.current.state.impressionCount).toBe(0);
    expect(result.current.state.isSessionDismissed).toBe(false);
  });

  it('should update completed state on complete action', () => {
    const memoryStorage = createMemoryStorage();
    const surveyId = 'test-survey-1';
    const { result } = renderHook(() => useSurveyStorage(surveyId, memoryStorage));

    act(() => {
      result.current.actions.complete();
    });

    expect(result.current.state.isCompleted).toBe(true);
  });

  it('should handle permanent skip actions', () => {
    const memoryStorage = createMemoryStorage();
    const surveyId = 'test-survey-1';
    const { result } = renderHook(() => useSurveyStorage(surveyId, memoryStorage));

    act(() => {
      result.current.actions.skipPermanently();
    });

    expect(result.current.state.isSkippedPermanently).toBe(true);
  });

  it('should record dismissed timestamp and session dismiss state', () => {
    const memoryStorage = createMemoryStorage();
    const surveyId = 'test-survey-1';
    const { result } = renderHook(() => useSurveyStorage(surveyId, memoryStorage));
    const now = Date.now();

    act(() => {
      result.current.actions.dismiss(now);
    });

    expect(result.current.state.dismissedAt).toBe(now);
    expect(result.current.state.isSessionDismissed).toBe(true);
  });

  it('should increment impression counts', () => {
    const memoryStorage = createMemoryStorage();
    const surveyId = 'test-survey-1';
    const { result } = renderHook(() => useSurveyStorage(surveyId, memoryStorage));

    let count;
    act(() => {
      count = result.current.actions.recordImpression();
    });

    expect(count).toBe(1);
    expect(result.current.state.impressionCount).toBe(1);

    act(() => {
      count = result.current.actions.recordImpression();
    });

    expect(count).toBe(2);
    expect(result.current.state.impressionCount).toBe(2);
  });

  it('should correctly handle draft get, save, and clear actions', () => {
    const memoryStorage = createMemoryStorage();
    const surveyId = 'test-survey-1';
    const questions = [
      { id: 'q1', type: 'text' as const, label: 'Q1' },
      { id: 'q2', type: 'checkbox' as const, label: 'Q2', options: ['A', 'B'] }
    ];
    const { result } = renderHook(() => useSurveyStorage(surveyId, memoryStorage, questions));

    const draftResponses = { q1: 'Val1', q2: ['A'] };

    act(() => {
      result.current.draft.save(draftResponses);
    });

    expect(result.current.draft.get()).toEqual(draftResponses);

    act(() => {
      result.current.draft.clear();
    });

    expect(result.current.draft.get()).toEqual({});
  });
});

import * as fc from 'fast-check';
import { STORAGE_KEYS } from '../constants';

describe('useSurveyStorage - Property 5: Sync isolation invariants', () => {
  const surveyId = 'prop5-test-survey';

  const synchronizedKeys = [
    STORAGE_KEYS.completed(surveyId),
    STORAGE_KEYS.skippedPermanently(surveyId),
    STORAGE_KEYS.dismissedAt(surveyId),
    STORAGE_KEYS.impressionCount(surveyId)
  ];

  it('non-matching storage keys leave state unchanged', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), fc.string(), (randomKey, randomValue) => {
        // Filter out keys that match the 4 synchronized keys
        if (synchronizedKeys.includes(randomKey)) return true; // skip this case

        const memoryStorage = createMemoryStorage();
        const { result } = renderHook(() => useSurveyStorage(surveyId, memoryStorage));

        const stateBefore = { ...result.current.state };

        act(() => {
          window.dispatchEvent(
            new StorageEvent('storage', { key: randomKey, newValue: randomValue })
          );
        });

        const stateAfter = result.current.state;

        expect(stateAfter.isCompleted).toBe(stateBefore.isCompleted);
        expect(stateAfter.isSkippedPermanently).toBe(stateBefore.isSkippedPermanently);
        expect(stateAfter.dismissedAt).toBe(stateBefore.dismissedAt);
        expect(stateAfter.impressionCount).toBe(stateBefore.impressionCount);
        expect(stateAfter.isSessionDismissed).toBe(stateBefore.isSessionDismissed);
      }),
      { numRuns: 100 }
    );
  });

  it('isSessionDismissed is never synchronized by storage events', () => {
    fc.assert(
      fc.property(fc.string(), (randomValue) => {
        const memoryStorage = createMemoryStorage();
        const { result } = renderHook(() => useSurveyStorage(surveyId, memoryStorage));

        // First dismiss the survey so isSessionDismissed is true
        act(() => {
          result.current.actions.dismiss(Date.now());
        });

        expect(result.current.state.isSessionDismissed).toBe(true);

        // Dispatch storage events for each of the 4 synchronized keys
        for (const syncKey of synchronizedKeys) {
          act(() => {
            window.dispatchEvent(
              new StorageEvent('storage', { key: syncKey, newValue: randomValue })
            );
          });

          // isSessionDismissed must remain true after each event
          expect(result.current.state.isSessionDismissed).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('useSurveyStorage - storage read-failure edge', () => {
  const failingStorage: StorageAdapter = {
    getItem() {
      return null;
    },
    setItem() {},
    removeItem() {}
  };

  it('uses safe defaults when storage adapter returns null for all reads', () => {
    const { result } = renderHook(() => useSurveyStorage('failing-survey', failingStorage));

    expect(result.current.state.isCompleted).toBe(false);
    expect(result.current.state.isSkippedPermanently).toBe(false);
    expect(result.current.state.dismissedAt).toBeNull();
    expect(result.current.state.impressionCount).toBe(0);
    expect(result.current.state.isSessionDismissed).toBe(false);
  });
});
