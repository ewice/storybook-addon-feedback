import type { SurveyField, SurveyResponses, SurveyResponseValue } from '../types';

const valueMatchesType = (type: SurveyField['type'], value: SurveyResponseValue): boolean => {
  switch (type) {
    case 'rating':
      return typeof value === 'number';
    case 'radio':
    case 'text':
    case 'textarea':
      return typeof value === 'string';
    case 'checkbox':
      return Array.isArray(value) && value.every((item) => typeof item === 'string');
    default:
      return false;
  }
};

export const sanitizeDraft = (raw: string | null, questions: SurveyField[]): SurveyResponses => {
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {};
  }

  const byId = new Map(questions.map((q) => [q.id, q]));
  const result: SurveyResponses = {};

  for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
    const question = byId.get(id);
    if (!question) continue;
    if (valueMatchesType(question.type, value as SurveyResponseValue)) {
      result[id] = value as SurveyResponseValue;
    }
  }

  return result;
};
