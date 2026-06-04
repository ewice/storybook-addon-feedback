import { SurveyConfig, SurveyResponses } from '../types';

export interface FeedbackPayload {
  surveyId: string;
  timestamp: string;
  responses: SurveyResponses;
}

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

  // Inject custom headers if provided, ensuring content-type is json
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.webhookHeaders
  };

  try {
    const res = await fetch(config.webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Server responded with status ${res.status}: ${res.statusText}`);
    }
  } catch (err) {
    console.error('[Feedback Survey Addon] Webhook submission failed:', err);
    throw err;
  }

  return payload;
};
