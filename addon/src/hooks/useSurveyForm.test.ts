import { renderHook, act } from '@testing-library/react';
import { SubmitEvent } from 'react';
import { describe, it, expect, vi } from 'vite-plus/test';
import type { SurveyConfig } from '../types';
import { useSurveyForm } from './useSurveyForm';

describe('useSurveyForm', () => {
  const mockConfig: SurveyConfig = {
    surveyId: 'test-survey',
    title: 'Test Survey',
    questions: [
      { id: 'q1', type: 'text', label: 'Question 1', required: true },
      { id: 'q2', type: 'checkbox', label: 'Question 2', required: false, options: ['A', 'B'] }
    ]
  };

  it('should initialize with values from draft', () => {
    const getDraft = vi.fn().mockReturnValue({ q1: 'Draft text' });
    const saveDraft = vi.fn();
    const clearDraft = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useSurveyForm({
        config: mockConfig,
        isCompleted: false,
        onSubmit,
        getDraft,
        saveDraft,
        clearDraft
      })
    );

    expect(result.current.values).toEqual({ q1: 'Draft text' });
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitted).toBe(false);
  });

  it('should update values and clear field errors on field change', () => {
    const getDraft = vi.fn().mockReturnValue({});
    const saveDraft = vi.fn();
    const clearDraft = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useSurveyForm({
        config: mockConfig,
        isCompleted: false,
        onSubmit,
        getDraft,
        saveDraft,
        clearDraft
      })
    );

    act(() => {
      result.current.handleFieldChange('q1', 'Updated text');
    });

    expect(result.current.values.q1).toBe('Updated text');
  });

  it('should submit successfully when inputs are valid', async () => {
    const getDraft = vi.fn().mockReturnValue({ q1: 'Valid text' });
    const saveDraft = vi.fn();
    const clearDraft = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useSurveyForm({
        config: mockConfig,
        isCompleted: false,
        onSubmit,
        getDraft,
        saveDraft,
        clearDraft
      })
    );

    const mockEvent = { preventDefault: vi.fn() } as unknown as SubmitEvent<HTMLFormElement>;
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(onSubmit).toHaveBeenCalledWith({ q1: 'Valid text' });
    expect(clearDraft).toHaveBeenCalled();
    expect(result.current.isSubmitted).toBe(true);
    expect(result.current.submissionError).toBeNull();
  });

  it('should prevent submission and populate validation errors if invalid', async () => {
    const getDraft = vi.fn().mockReturnValue({});
    const saveDraft = vi.fn();
    const clearDraft = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useSurveyForm({
        config: mockConfig,
        isCompleted: false,
        onSubmit,
        getDraft,
        saveDraft,
        clearDraft
      })
    );

    const mockEvent = { preventDefault: vi.fn() } as unknown as SubmitEvent<HTMLFormElement>;
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.q1).toBe('This field is required.');
    expect(result.current.isSubmitted).toBe(false);
  });

  it('should trigger draft save on unmount if not submitted', () => {
    const getDraft = vi.fn().mockReturnValue({ q1: 'Some Text' });
    const saveDraft = vi.fn();
    const clearDraft = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const { unmount } = renderHook(() =>
      useSurveyForm({
        config: mockConfig,
        isCompleted: false,
        onSubmit,
        getDraft,
        saveDraft,
        clearDraft
      })
    );

    unmount();

    expect(saveDraft).toHaveBeenCalledWith({ q1: 'Some Text' });
  });

  it('should set submissionError and clear isSubmitting on submission failure', async () => {
    const getDraft = vi.fn().mockReturnValue({ q1: 'Valid text' });
    const saveDraft = vi.fn();
    const clearDraft = vi.fn();
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useSurveyForm({
        config: mockConfig,
        isCompleted: false,
        onSubmit,
        getDraft,
        saveDraft,
        clearDraft
      })
    );

    const mockEvent = { preventDefault: vi.fn() } as unknown as SubmitEvent<HTMLFormElement>;
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.submissionError).toBe('Failed to submit feedback. Please try again.');
    expect(result.current.isSubmitted).toBe(false);
  });

  it('should not emit console.error from the form hook on submission failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const getDraft = vi.fn().mockReturnValue({ q1: 'Valid text' });
    const saveDraft = vi.fn();
    const clearDraft = vi.fn();
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useSurveyForm({
        config: mockConfig,
        isCompleted: false,
        onSubmit,
        getDraft,
        saveDraft,
        clearDraft
      })
    );

    const mockEvent = { preventDefault: vi.fn() } as unknown as SubmitEvent<HTMLFormElement>;
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
