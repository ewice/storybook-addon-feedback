import { FC } from 'react';
import { styled } from 'storybook/theming';
import type { SurveyConfig, SurveyResponses } from '../types';
import { useSurveyForm } from '../hooks/useSurveyForm';
import { Button } from '../ui/Button';
import { ErrorSummary } from '../ui/ErrorSummary';
import { COMPONENT_MESSAGES, resolveMessage } from '../utils/messages';
import { QuestionRenderer } from './QuestionRenderer';
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
  getDraft: () => SurveyResponses;
  saveDraft: (values: SurveyResponses) => void;
  clearDraft: () => void;
}

export const SurveyForm: FC<SurveyFormProps> = ({
  config,
  isCompleted,
  onSubmit,
  onClose,
  onSkipPermanent,
  getDraft,
  saveDraft,
  clearDraft
}) => {
  const {
    values,
    errors,
    isSubmitting,
    isSubmitted,
    submissionError,
    handleSubmit,
    handleFieldChange,
    handleCheckboxChange,
    fieldRefs
  } = useSurveyForm({ config, isCompleted, onSubmit, getDraft, saveDraft, clearDraft });

  const skipPermanentLabel = resolveMessage(
    config.messages?.skipPermanent,
    COMPONENT_MESSAGES.skipPermanent
  );
  const cancelLabel = resolveMessage(config.messages?.cancel, COMPONENT_MESSAGES.cancel);
  const submitLabel = resolveMessage(
    config.messages?.submitFeedback,
    COMPONENT_MESSAGES.submitFeedback
  );
  const submittingLabel = resolveMessage(
    config.messages?.submitting,
    COMPONENT_MESSAGES.submitting
  );

  if (isSubmitted) {
    return <SurveyThankYou onClose={onClose} messages={config.messages} />;
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

      {submissionError && <SubmissionError role="alert">{submissionError}</SubmissionError>}

      <FooterActions>
        <Button variant="dangerSubtle" onClick={onSkipPermanent}>
          {skipPermanentLabel}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </FooterActions>
    </FormContainer>
  );
};
