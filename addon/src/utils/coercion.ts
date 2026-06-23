import type { SurveyFieldType, SurveyResponseValue } from '../types';

/**
 * Coerces a survey response value to the correct runtime type for a given field type.
 * Returns a sensible default when the value is missing or mismatched.
 * This function is total (handles all field types) and idempotent.
 */
export const coerceValue = (
  type: SurveyFieldType,
  value: SurveyResponseValue | undefined
): SurveyResponseValue => {
  switch (type) {
    case 'rating':
      return typeof value === 'number' ? value : 0;
    case 'checkbox':
      return Array.isArray(value) ? value : [];
    case 'radio':
    case 'text':
    case 'textarea':
      return typeof value === 'string' ? value : '';
    default:
      return typeof value === 'string' ? value : '';
  }
};
