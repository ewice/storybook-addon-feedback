import { useState, useEffect, useRef, useCallback, SubmitEvent } from 'react';
import type { SurveyConfig, SurveyResponses, SurveyResponseValue } from '../types';
import { MESSAGES, resolveMessage } from '../utils/messages';
import { validateSurvey } from '../utils/validation';

export interface UseSurveyFormProps {
  config: SurveyConfig;
  isCompleted: boolean;
  onSubmit: (data: SurveyResponses) => Promise<void>;
  getDraft: () => SurveyResponses;
  saveDraft: (values: SurveyResponses) => void;
  clearDraft: () => void;
}

export const useSurveyForm = ({
  config,
  isCompleted,
  onSubmit,
  getDraft,
  saveDraft,
  clearDraft
}: UseSurveyFormProps) => {
  const [values, setValues] = useState<SurveyResponses>(() => getDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(() => isCompleted);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const valuesRef = useRef(values);
  valuesRef.current = values;

  const focusQuestion = useCallback((questionId: string) => {
    const element = fieldRefs.current[questionId];
    if (element) {
      element.focus();
    }
  }, []);

  const validate = useCallback(() => {
    const nextErrors = validateSurvey(config.questions, valuesRef.current, config.messages);
    setErrors(nextErrors);

    const firstInvalidQuestionId = config.questions.find((question) => nextErrors[question.id])?.id;
    if (firstInvalidQuestionId) {
      focusQuestion(firstInvalidQuestionId);
    }

    return Object.keys(nextErrors).length === 0;
  }, [config.questions, config.messages, focusQuestion]);

  const handleSubmit = useCallback(
    async (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!validate()) {
        return;
      }

      setIsSubmitting(true);
      setSubmissionError(null);

      try {
        await onSubmit(valuesRef.current);
        clearDraft();
        setIsSubmitted(true);
      } catch {
        setSubmissionError(
          resolveMessage(config.messages?.submissionFailure, MESSAGES.submissionFailure)
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, onSubmit, clearDraft, config.messages]
  );

  useEffect(() => {
    const save = () => {
      if (!isSubmitted) {
        saveDraft(valuesRef.current);
      }
    };
    window.addEventListener('beforeunload', save);
    return () => {
      save();
      window.removeEventListener('beforeunload', save);
    };
  }, [saveDraft, isSubmitted]);

  const clearFieldError = useCallback((fieldId: string) => {
    setErrors((prev) => {
      if (!prev[fieldId]) {
        return prev;
      }

      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const handleFieldChange = useCallback(
    (fieldId: string, nextValue: SurveyResponseValue) => {
      setValues((prev) => ({ ...prev, [fieldId]: nextValue }));
      clearFieldError(fieldId);
    },
    [clearFieldError]
  );

  const handleCheckboxChange = useCallback(
    (fieldId: string, option: string, checked: boolean) => {
      setValues((prev) => {
        const current = (prev[fieldId] as string[]) || [];
        const next = checked ? [...current, option] : current.filter((item) => item !== option);
        return { ...prev, [fieldId]: next };
      });
      clearFieldError(fieldId);
    },
    [clearFieldError]
  );

  return {
    values,
    errors,
    isSubmitting,
    isSubmitted,
    submissionError,
    handleSubmit,
    handleFieldChange,
    handleCheckboxChange,
    fieldRefs
  };
};
