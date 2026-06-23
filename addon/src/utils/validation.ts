import type { SurveyField, SurveyMessages, SurveyResponses } from '../types';
import { MESSAGES, resolveMessage } from './messages';

/**
 * Validates required survey answers and returns a map of question ID to error
 * message. An empty map means the survey passed validation. Optional `messages`
 * override the default error copy per error type.
 */
export const validateSurvey = (
  questions: SurveyField[],
  values: SurveyResponses,
  messages?: SurveyMessages
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const selectOptionMsg = resolveMessage(messages?.selectOption, MESSAGES.selectOption);
  const selectRatingMsg = resolveMessage(messages?.selectRating, MESSAGES.selectRating);
  const requiredFieldMsg = resolveMessage(messages?.requiredField, MESSAGES.requiredField);

  questions.forEach((question) => {
    if (!question.required) return;
    const value = values[question.id];

    if (question.type === 'checkbox') {
      if (!Array.isArray(value) || value.length === 0) {
        errors[question.id] = selectOptionMsg;
      }
      return;
    }
    if (question.type === 'rating') {
      if (!value || value === 0) {
        errors[question.id] = selectRatingMsg;
      }
      return;
    }
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors[question.id] = requiredFieldMsg;
    }
  });

  return errors;
};
