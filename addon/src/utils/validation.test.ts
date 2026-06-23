import * as fc from 'fast-check';
import { describe, it, expect } from 'vite-plus/test';
import type { SurveyField } from '../types';
import { resolveMessage } from './messages';
import { validateSurvey } from './validation';

describe('validateSurvey', () => {
  it('should pass validation when all fields are optional and empty', () => {
    const questions: SurveyField[] = [
      { id: 'q1', type: 'text', label: 'Feedback', required: false }
    ];
    const errors = validateSurvey(questions, {});
    expect(errors).toEqual({});
  });

  it('should fail validation when a required text field is empty', () => {
    const questions: SurveyField[] = [
      { id: 'q1', type: 'text', label: 'Feedback', required: true }
    ];
    const errorsEmpty = validateSurvey(questions, { q1: '' });
    expect(errorsEmpty.q1).toBe('This field is required.');

    const errorsMissing = validateSurvey(questions, {});
    expect(errorsMissing.q1).toBe('This field is required.');
  });

  it('should fail validation when a required rating field is 0 or empty', () => {
    const questions: SurveyField[] = [
      { id: 'q1', type: 'rating', label: 'Rate us', required: true }
    ];
    const errorsZero = validateSurvey(questions, { q1: 0 });
    expect(errorsZero.q1).toBe('Please select a rating.');

    const errorsMissing = validateSurvey(questions, {});
    expect(errorsMissing.q1).toBe('Please select a rating.');
  });

  it('should fail validation when a required checkbox group is empty', () => {
    const questions: SurveyField[] = [
      { id: 'q1', type: 'checkbox', label: 'Select options', required: true, options: ['A', 'B'] }
    ];
    const errorsEmptyArray = validateSurvey(questions, { q1: [] });
    expect(errorsEmptyArray.q1).toBe('Please select at least one option.');

    const errorsMissing = validateSurvey(questions, {});
    expect(errorsMissing.q1).toBe('Please select at least one option.');
  });

  it('should pass validation when required fields are filled correctly', () => {
    const questions: SurveyField[] = [
      { id: 'q1', type: 'text', label: 'Feedback', required: true },
      { id: 'q2', type: 'rating', label: 'Rate', required: true },
      { id: 'q3', type: 'checkbox', label: 'Select', required: true, options: ['A', 'B'] }
    ];
    const errors = validateSurvey(questions, {
      q1: 'Excellent product',
      q2: 5,
      q3: ['A']
    });
    expect(errors).toEqual({});
  });
});

describe('resolveMessage - Property 12: Message override resolution', () => {
  const FALLBACK = 'default fallback';

  it('returns the override when it contains at least one non-whitespace character', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (override) => {
          expect(resolveMessage(override, FALLBACK)).toBe(override);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns the fallback when the override is whitespace-only', () => {
    const whitespaceArb = fc
      .array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 50 })
      .map((chars) => chars.join(''));

    fc.assert(
      fc.property(whitespaceArb, (whitespaceOverride) => {
        expect(resolveMessage(whitespaceOverride, FALLBACK)).toBe(FALLBACK);
      }),
      { numRuns: 100 }
    );
  });

  it('returns the fallback when the override is an empty string', () => {
    expect(resolveMessage('', FALLBACK)).toBe(FALLBACK);
  });

  it('returns the fallback when the override is undefined', () => {
    expect(resolveMessage(undefined, FALLBACK)).toBe(FALLBACK);
  });
});
