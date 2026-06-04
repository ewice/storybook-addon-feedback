import { describe, it, expect } from 'vite-plus/test';
import { validateSurvey } from './validation';
import { SurveyField } from '../types';

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
