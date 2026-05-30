import { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { useSurveyStorage } from './useSurveyStorage';
import { SurveyConfig, SurveyResponses, SurveyResponseValue } from '../types';

export interface UseSurveyFormProps {
  config: SurveyConfig;
  isCompleted: boolean;
  onSubmit: (data: SurveyResponses) => Promise<void>;
}

export const useSurveyForm = ({ config, isCompleted, onSubmit }: UseSurveyFormProps) => {
  const storage = useSurveyStorage(config.surveyId);
  const [values, setValues] = useState<SurveyResponses>(() => storage.getDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(() => isCompleted);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!isSubmitted) {
      storage.saveDraft(values);
    }
  }, [isSubmitted, storage, values]);

  const handleFieldChange = useCallback((fieldId: string, nextValue: SurveyResponseValue) => {
    setValues((prev) => ({ ...prev, [fieldId]: nextValue }));

    setErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const handleCheckboxChange = useCallback((fieldId: string, option: string, checked: boolean) => {
    setValues(prev => {
      const current = (prev[fieldId] as string[]) || [];
      const next = checked ? [...current, option] : current.filter((item) => item !== option);
      return { ...prev, [fieldId]: next };
    });

    setErrors(prev => {
      if (!prev[fieldId]) {
        return prev;
      }

      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const focusQuestion = useCallback((questionId: string) => {
    const element = fieldRefs.current[questionId];
    if (element) {
      element.focus();
    }
  }, []);

  const validate = useCallback(() => {
    const nextErrors: Record<string, string> = {};

    config.questions.forEach((question) => {
      if (!question.required) {
        return;
      }

      const value = values[question.id];

      if (question.type === 'checkbox') {
        if (!value || (value as string[]).length === 0) {
          nextErrors[question.id] = 'Please select at least one option.';
        }
        return;
      }

      if (question.type === 'rating') {
        if (!value || value === 0) {
          nextErrors[question.id] = 'Please select a rating.';
        }
        return;
      }

      if (!value || (typeof value === 'string' && value.trim() === '')) {
        nextErrors[question.id] = 'This field is required.';
      }
    });

    setErrors(nextErrors);

    const firstInvalidQuestionId = config.questions.find((question) => nextErrors[question.id])?.id;
    if (firstInvalidQuestionId) {
      focusQuestion(firstInvalidQuestionId);
    }

    return Object.keys(nextErrors).length === 0;
  }, [config.questions, values, focusQuestion]);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      if (!validate()) {
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit(values);
        storage.clearDraft();
        setIsSubmitted(true);
      } catch (error) {
        console.error('Failed to submit survey:', error);
        setErrors((prev) => ({ ...prev, submit: 'Failed to submit feedback. Please try again.' }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, onSubmit, values, storage]
  );

  return {
    values,
    errors,
    isSubmitting,
    isSubmitted,
    handleFieldChange,
    handleCheckboxChange,
    handleSubmit,
    fieldRefs
  };
};
