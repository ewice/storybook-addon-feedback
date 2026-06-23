import type { SurveyConfig, SurveyResponses } from '../types';
import {
  DEFAULT_WEBHOOK_TIMEOUT_MS,
  MIN_WEBHOOK_TIMEOUT_MS,
  MAX_WEBHOOK_TIMEOUT_MS
} from '../constants';

export interface FeedbackPayload {
  surveyId: string;
  timestamp: string;
  responses: SurveyResponses;
}

/**
 * Resolves the webhook request timeout in milliseconds. Returns the configured
 * value when it is a finite number within the allowed bounds; otherwise falls
 * back to the default timeout.
 */
export const resolveTimeout = (config: SurveyConfig): number => {
  const configuredTimeout = config.requestTimeoutMs;
  if (
    typeof configuredTimeout === 'number' &&
    Number.isFinite(configuredTimeout) &&
    configuredTimeout >= MIN_WEBHOOK_TIMEOUT_MS &&
    configuredTimeout <= MAX_WEBHOOK_TIMEOUT_MS
  ) {
    return configuredTimeout;
  }
  return DEFAULT_WEBHOOK_TIMEOUT_MS;
};

/**
 * Dispatches the survey feedback payload to the designated webhook endpoint.
 *
 * @param config - The active survey configuration containing webhookUrl and webhookHeaders.
 * @param responses - The map of question IDs to user answers.
 * @returns A Promise resolving to the feedback payload on success.
 */
export const submitFeedbackWebhook = async (
  config: SurveyConfig,
  responses: SurveyResponses
): Promise<FeedbackPayload> => {
  const payload: FeedbackPayload = {
    surveyId: config.surveyId,
    timestamp: new Date().toISOString(),
    responses
  };

  if (!config.webhookUrl) {
    return payload;
  }

  const controller = new AbortController();
  const timeoutMs = resolveTimeout(config);
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.webhookHeaders
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}: ${response.statusText}`);
    }
  } catch (caughtError) {
    const error =
      caughtError instanceof Error && caughtError.name === 'AbortError'
        ? new Error(`Webhook request timed out after ${timeoutMs}ms`)
        : caughtError;
    console.error('[Feedback Survey Addon] Webhook submission failed:', error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  return payload;
};
