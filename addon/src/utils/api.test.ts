import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { submitFeedbackWebhook } from './api';
import { SurveyConfig } from '../types';

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
      body: JSON.stringify(payload)
    });
  });

  it('should throw an error if the request fails', async () => {
    const config: SurveyConfig = {
      surveyId: 'test-survey',
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
