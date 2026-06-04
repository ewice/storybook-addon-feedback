import { SurveyField, SurveyResponses } from '../types';

export const validateSurvey = (
  questions: SurveyField[],
  values: SurveyResponses
): Record<string, string> => {
  const errors: Record<string, string> = {};

  questions.forEach((question) => {
    if (!question.required) return;
    const value = values[question.id];

    if (question.type === 'checkbox') {
      if (!value || (value as string[]).length === 0) {
        errors[question.id] = 'Please select at least one option.';
      }
      return;
    }
    if (question.type === 'rating') {
      if (!value || value === 0) {
        errors[question.id] = 'Please select a rating.';
      }
      return;
    }
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors[question.id] = 'This field is required.';
    }
  });

  return errors;
};
