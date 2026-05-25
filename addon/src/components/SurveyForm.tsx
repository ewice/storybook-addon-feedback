import React from 'react';
import { styled } from 'storybook/theming';
import { SurveyConfig, SurveyResponses } from '../types';
import { useSurveyForm } from '../hooks/useSurveyForm';
import { QuestionRenderer } from './QuestionRenderer';
import { Button, ErrorSummary } from '../ui';
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
  onSubmit: (data: SurveyResponses) => Promise<void>;
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
  const {
    values,
    errors,
    isSubmitting,
    isSubmitted,
    handleFieldChange,
    handleCheckboxChange,
    handleSubmit,
    fieldRefs
  } = useSurveyForm({ config, isCompleted, onSubmit });

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

      {config.questions.map((question) => (
        <QuestionRenderer
          key={question.id}
          question={question}
          value={values[question.id]}
          error={errors[question.id]}
          onChange={handleFieldChange}
          onCheckboxChange={handleCheckboxChange}
          fieldRefs={fieldRefs}
        />
      ))}

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
