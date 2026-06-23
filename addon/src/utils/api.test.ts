import * as fc from 'fast-check';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vite-plus/test';
import type { SurveyConfig } from '../types';
import {
  DEFAULT_WEBHOOK_TIMEOUT_MS,
  MIN_WEBHOOK_TIMEOUT_MS,
  MAX_WEBHOOK_TIMEOUT_MS
} from '../constants';
import { submitFeedbackWebhook, resolveTimeout } from './api';

describe('submitFeedbackWebhook', () => {
  const responses = { q1: 'Excellent' };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return payload directly if webhookUrl is not configured', async () => {
    const config: SurveyConfig = {
      surveyId: 'test-survey',
      title: 'Test Survey',
      questions: []
    };

    const payload = await submitFeedbackWebhook(config, responses);
    expect(payload.surveyId).toBe('test-survey');
    expect(payload.responses).toEqual(responses);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should post payload to webhookUrl if configured', async () => {
    const config: SurveyConfig = {
      surveyId: 'test-survey',
      title: 'Test Survey',
      questions: [],
      webhookUrl: 'https://example.com/webhook',
      webhookHeaders: { 'X-Custom': 'value' }
    };

    (fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200
    });

    const payload = await submitFeedbackWebhook(config, responses);
    expect(payload.surveyId).toBe('test-survey');
    expect(fetch).toHaveBeenCalledWith('https://example.com/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom': 'value'
      },
      body: JSON.stringify(payload),
      signal: expect.any(AbortSignal)
    });
  });

  it('should throw an error if the request fails', async () => {
    const config: SurveyConfig = {
      surveyId: 'test-survey',
      title: 'Test Survey',
      questions: [],
      webhookUrl: 'https://example.com/webhook'
    };

    (fetch as Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await expect(submitFeedbackWebhook(config, responses)).rejects.toThrow(
      'Server responded with status 500: Internal Server Error'
    );
  });
});

describe('resolveTimeout', () => {
  const makeConfig = (requestTimeoutMs: unknown): SurveyConfig =>
    ({
      surveyId: 'x',
      title: 'x',
      questions: [],
      requestTimeoutMs
    }) as SurveyConfig;

  it('returns the configured value when within valid range [1000, 120000]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: MIN_WEBHOOK_TIMEOUT_MS, max: MAX_WEBHOOK_TIMEOUT_MS }),
        (timeout) => {
          expect(resolveTimeout(makeConfig(timeout))).toBe(timeout);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns default when value is below minimum', () => {
    fc.assert(
      fc.property(fc.integer({ min: -1000000, max: 999 }), (timeout) => {
        expect(resolveTimeout(makeConfig(timeout))).toBe(DEFAULT_WEBHOOK_TIMEOUT_MS);
      }),
      { numRuns: 100 }
    );
  });

  it('returns default when value is above maximum', () => {
    fc.assert(
      fc.property(fc.integer({ min: 120001, max: 1000000 }), (timeout) => {
        expect(resolveTimeout(makeConfig(timeout))).toBe(DEFAULT_WEBHOOK_TIMEOUT_MS);
      }),
      { numRuns: 100 }
    );
  });

  it('returns default for non-numeric or non-finite values', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(undefined),
          fc.constant(null),
          fc.constant(NaN),
          fc.constant(Infinity),
          fc.string()
        ),
        (value) => {
          expect(resolveTimeout(makeConfig(value))).toBe(DEFAULT_WEBHOOK_TIMEOUT_MS);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('submitFeedbackWebhook - timing and logging', () => {
  const baseConfig: SurveyConfig = {
    surveyId: 'timing-test',
    title: 'Timing Survey',
    questions: [],
    webhookUrl: 'https://example.com/hook'
  };
  const responses = { q1: 'answer' };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('rejects with timeout error when fetch never resolves', async () => {
    (fetch as Mock).mockImplementation(
      (_url: string, options: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          options.signal.addEventListener('abort', () => {
            const abortError = new Error('The operation was aborted.');
            abortError.name = 'AbortError';
            reject(abortError);
          });
        })
    );

    let rejectedError: unknown;
    const promise = submitFeedbackWebhook(baseConfig, responses).catch((error) => {
      rejectedError = error;
    });
    await vi.advanceTimersByTimeAsync(10000);
    await promise;

    expect(rejectedError).toBeInstanceOf(Error);
    expect((rejectedError as Error).message).toMatch(/timed out/);
  });

  it('resolves successfully and clears timer when fetch succeeds', async () => {
    (fetch as Mock).mockResolvedValue({ ok: true, status: 200 });

    const payload = await submitFeedbackWebhook(baseConfig, responses);
    expect(payload.surveyId).toBe('timing-test');
    expect(payload.responses).toEqual(responses);

    await vi.advanceTimersByTimeAsync(20000);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('returns payload and skips fetch when webhookUrl is absent', async () => {
    const configWithoutUrl: SurveyConfig = {
      surveyId: 'no-url',
      title: 'No URL Survey',
      questions: []
    };

    const payload = await submitFeedbackWebhook(configWithoutUrl, responses);
    expect(payload.surveyId).toBe('no-url');
    expect(payload.responses).toEqual(responses);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('logs exactly once on failure via console.error', async () => {
    const networkError = new Error('Network unreachable');
    (fetch as Mock).mockRejectedValue(networkError);

    await expect(submitFeedbackWebhook(baseConfig, responses)).rejects.toThrow(
      'Network unreachable'
    );

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      '[Feedback Survey Addon] Webhook submission failed:',
      networkError
    );
  });
});
