import React, { useEffect, useState } from 'react';
import { styled } from 'storybook/theming';
import { SurveyConfig, SurveyField } from '../types';
import { useSurveyStorage } from '../hooks/useSurveyStorage';
import { CheckboxGroupInput } from './inputs/CheckboxGroupInput';
import { RadioGroupInput } from './inputs/RadioGroupInput';
import { StarRatingInput } from './inputs/StarRatingInput';
import { TextInputField } from './inputs/TextInputField';
import { TextAreaField } from './inputs/TextAreaField';
import { Button } from './ui/Button';
import { Field } from './ui/Field';
import { Fieldset } from './ui/Fieldset';
import { ErrorSummary } from './ui/ErrorSummary';
import { SurveyThankYou } from './SurveyThankYou';

const FormContainer = styled.form(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  fontFamily: theme.typography.fonts.base
}));

const FooterActions = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '8px',
  '& > *:first-of-type': {
    marginRight: 'auto'
  }
});

const SubmissionError = styled.p(({ theme }) => ({
  margin: 0,
  fontSize: theme.typography.size.s1,
  color: theme.fgColor.negative,
  textAlign: 'center'
}));

interface SurveyFormProps {
  config: SurveyConfig;
  isCompleted: boolean;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onClose: () => void;
  onSkipPermanent: () => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({
  config,
  isCompleted,
  onSubmit,
  onClose,
  onSkipPermanent
}) => {
  const storage = useSurveyStorage(config.surveyId);
  const [values, setValues] = useState<Record<string, any>>(() => storage.getDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(() => isCompleted);

  useEffect(() => {
    if (!isSubmitted) {
      storage.saveDraft(values);
    }
  }, [isSubmitted, storage, values]);

  const handleFieldChange = (fieldId: string, nextValue: any) => {
    setValues((prev) => ({ ...prev, [fieldId]: nextValue }));

    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const current = (values[fieldId] as string[]) || [];
    const next = checked ? [...current, option] : current.filter((item) => item !== option);

    handleFieldChange(fieldId, next);
  };

  const focusQuestion = (questionId: string) => {
    const question = config.questions.find((item) => item.id === questionId);

    if (!question) {
      return;
    }

    const targetId =
      question.type === 'rating'
        ? `${question.id}-1`
        : question.type === 'radio' || question.type === 'checkbox'
          ? `${question.id}-0`
          : question.id;

    requestAnimationFrame(() => {
      document.getElementById(targetId)?.focus();
    });
  };

  const validate = () => {
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
  };

  const handleSubmit = async (event: React.FormEvent) => {
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
      setErrors({ submit: 'Failed to submit feedback. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: SurveyField) => {
    const error = errors[question.id];
    const commonProps = {
      id: question.id,
      label: question.label,
      required: question.required,
      error
    };

    if (question.type === 'rating') {
      return (
        <Fieldset key={question.id} {...commonProps}>
          {({ describedBy, invalid }) => (
            <StarRatingInput
              name={question.id}
              value={values[question.id] || 0}
              onChange={(rating) => handleFieldChange(question.id, rating)}
              ariaDescribedBy={describedBy}
              ariaInvalid={invalid}
            />
          )}
        </Fieldset>
      );
    }

    if (question.type === 'radio' && question.options) {
      return (
        <Fieldset key={question.id} {...commonProps}>
          {({ describedBy, invalid }) => (
            <RadioGroupInput
              name={question.id}
              options={question.options}
              value={values[question.id] || ''}
              onChange={(option) => handleFieldChange(question.id, option)}
              ariaDescribedBy={describedBy}
              ariaInvalid={invalid}
              direction={question.direction}
            />
          )}
        </Fieldset>
      );
    }

    if (question.type === 'checkbox' && question.options) {
      return (
        <Fieldset key={question.id} {...commonProps}>
          {({ describedBy, invalid }) => (
            <CheckboxGroupInput
              name={question.id}
              options={question.options}
              values={values[question.id] || []}
              onChange={(option, checked) => handleCheckboxChange(question.id, option, checked)}
              ariaDescribedBy={describedBy}
              ariaInvalid={invalid}
              direction={question.direction}
            />
          )}
        </Fieldset>
      );
    }

    if (question.type === 'textarea') {
      return (
        <Field key={question.id} {...commonProps}>
          {({ describedBy, invalid }) => (
            <TextAreaField
              id={question.id}
              placeholder={question.placeholder}
              value={values[question.id] || ''}
              onChange={(text) => handleFieldChange(question.id, text)}
              ariaDescribedBy={describedBy}
              ariaInvalid={invalid}
              required={question.required}
            />
          )}
        </Field>
      );
    }

    return (
      <Field key={question.id} {...commonProps}>
        {({ describedBy, invalid }) => (
          <TextInputField
            id={question.id}
            placeholder={question.placeholder}
            value={values[question.id] || ''}
            onChange={(text) => handleFieldChange(question.id, text)}
            ariaDescribedBy={describedBy}
            ariaInvalid={invalid}
            required={question.required}
          />
        )}
      </Field>
    );
  };

  if (isSubmitted) {
    return <SurveyThankYou onClose={onClose} />;
  }

  const errorSummaryItems = config.questions
    .filter((question) => errors[question.id])
    .map((question) => ({
      id: question.id,
      label: question.label,
      message: errors[question.id]
    }));

  return (
    <FormContainer onSubmit={handleSubmit} noValidate>
      {errorSummaryItems.length > 0 && <ErrorSummary items={errorSummaryItems} />}

      {config.questions.map(renderQuestion)}

      {errors.submit && <SubmissionError role="alert">{errors.submit}</SubmissionError>}

      <FooterActions>
        <Button variant="dangerSubtle" onClick={onSkipPermanent}>
          Don't show again
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </FooterActions>
    </FormContainer>
  );
};
