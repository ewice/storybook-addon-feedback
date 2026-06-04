import { describe, it, expect, vi, beforeEach, afterEach } from 'vite-plus/test';
import { renderHook, act } from '@testing-library/react';
import { useSurveyLifecycle } from './useSurveyLifecycle';
import { SurveyConfig } from '../types';
import { SurveyStorage } from './useSurveyStorage';

describe('useSurveyLifecycle', () => {
  let mockPersistence: SurveyStorage;
  const mockConfig: SurveyConfig = {
    surveyId: 'test-survey',
    title: 'Test Survey',
    questions: [{ id: 'q1', type: 'text', label: 'Q1' }],
    trigger: {
      delayMs: 2000,
      storyCount: 3
    }
  };

  beforeEach(() => {
    vi.useFakeTimers();

    mockPersistence = {
      state: {
        isCompleted: false,
        isSkippedPermanently: false,
        dismissedAt: null,
        impressionCount: 0,
        isSessionDismissed: false
      },
      actions: {
        complete: vi.fn(),
        skipPermanently: vi.fn(),
        dismiss: vi.fn(),
        recordImpression: vi.fn().mockReturnValue(1)
      },
      draft: {
        get: vi.fn().mockReturnValue({}),
        save: vi.fn(),
        clear: vi.fn()
      }
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should trigger popup after delay', () => {
    const onStoryChange = vi.fn().mockReturnValue(vi.fn());

    const { result } = renderHook(() =>
      useSurveyLifecycle({
        config: mockConfig,
        persistence: mockPersistence,
        onStoryChange
      })
    );

    expect(result.current.isOpen).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockPersistence.actions.recordImpression).toHaveBeenCalled();
    expect(result.current.isOpen).toBe(true);
  });

  it('should trigger popup on story navigation count', () => {
    let storyChangeHandler: () => void = () => {};
    const onStoryChange = vi.fn().mockImplementation((cb) => {
      storyChangeHandler = cb;
      return vi.fn(); // unsubscribe fn
    });

    const { result } = renderHook(() =>
      useSurveyLifecycle({
        config: mockConfig,
        persistence: mockPersistence,
        onStoryChange
      })
    );

    // Initial state is closed
    expect(result.current.isOpen).toBe(false);

    // Navigate stories
    act(() => {
      storyChangeHandler();
    });
    expect(result.current.isOpen).toBe(false);

    act(() => {
      storyChangeHandler();
    });
    expect(result.current.isOpen).toBe(false);

    // Third navigation should trigger it (storyCount: 3)
    act(() => {
      storyChangeHandler();
    });
    expect(mockPersistence.actions.recordImpression).toHaveBeenCalled();
    expect(result.current.isOpen).toBe(true);
  });

  it('should toggle state via keyboard shortcut Alt+Shift+S', () => {
    const onStoryChange = vi.fn().mockReturnValue(vi.fn());

    const { result } = renderHook(() =>
      useSurveyLifecycle({
        config: mockConfig,
        persistence: mockPersistence,
        onStoryChange
      })
    );

    expect(result.current.isOpen).toBe(false);

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 's',
        altKey: true,
        shiftKey: true
      });
      window.dispatchEvent(event);
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'S',
        altKey: true,
        shiftKey: true
      });
      window.dispatchEvent(event);
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should suppress auto-popup if completed', () => {
    mockPersistence.state.isCompleted = true;
    const onStoryChange = vi.fn().mockReturnValue(vi.fn());

    const { result } = renderHook(() =>
      useSurveyLifecycle({
        config: mockConfig,
        persistence: mockPersistence,
        onStoryChange
      })
    );

    expect(result.current.shouldBlockAutoPopup).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockPersistence.actions.recordImpression).not.toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);
  });
});
