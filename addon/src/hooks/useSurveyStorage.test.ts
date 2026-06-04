import { describe, it, expect } from 'vite-plus/test';
import { renderHook, act } from '@testing-library/react';
import { useSurveyStorage } from './useSurveyStorage';
import { createMemoryStorage } from '../utils/storage';

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
    const { result } = renderHook(() => useSurveyStorage(surveyId, memoryStorage));

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
