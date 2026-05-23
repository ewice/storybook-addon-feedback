import React from 'react';
import { useParameter } from 'storybook/manager-api';
import { IconButton } from 'storybook/internal/components';
import { SupportIcon } from '@storybook/icons';
import { styled } from 'storybook/theming';
import { SurveyConfig } from '../types';
import { SurveyModal } from './SurveyModal';
import { useSurveyStorage } from '../hooks/useSurveyStorage';
import { useSurveyLifecycle } from '../hooks/useSurveyLifecycle';
import { submitFeedbackWebhook } from '../utils/api';

declare global {
  const STORYBOOK_FEEDBACK_SURVEY_OPTIONS: any;
}

const IconWrapper = styled.div({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const NotificationDot = styled.div(({ theme }) => ({
  position: 'absolute',
  top: '2px',
  right: '2px',
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: theme.color.negative || '#FF4400'
}));

interface SurveyManagerProps {
  api: any;
}

export const SurveyManager: React.FC<SurveyManagerProps> = ({ api }) => {
  const buildTimeOptions =
    typeof STORYBOOK_FEEDBACK_SURVEY_OPTIONS === 'undefined'
      ? {}
      : STORYBOOK_FEEDBACK_SURVEY_OPTIONS;

  const parameterOptions = useParameter<SurveyConfig | null>('feedbackSurvey', null);

  const config: SurveyConfig = {
    surveyId: 'default-survey-v1',
    title: 'Feedback Survey',
    description: 'Help us improve by sharing your thoughts!',
    questions: [],
    ...buildTimeOptions,
    ...parameterOptions
  };

  const storage = useSurveyStorage(config.surveyId);

  const { isOpen, setIsOpen } = useSurveyLifecycle({
    config,
    isCompleted: storage.isCompleted,
    isSkippedPermanently: storage.isSkippedPermanently,
    dismissedAt: storage.dismissedAt,
    impressionCount: storage.impressionCount,
    incrementImpressions: storage.incrementImpressions,
    api,
    isSessionDismissed: storage.isSessionDismissed
  });

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (!storage.isCompleted) {
      storage.setDismissed(Date.now());
    }
  };

  const handleSkipPermanent = () => {
    setIsOpen(false);
    storage.setSkippedPermanently();
  };

  const handleSubmit = async (responses: Record<string, any>) => {
    const payload = await submitFeedbackWebhook(config, responses);

    const channel = api.getChannel();
    channel.emit('feedback-survey/submitted', payload);

    storage.setCompleted();
  };

  if (!config.questions || config.questions.length === 0) {
    return null;
  }

  const showNotification = !storage.isCompleted && !storage.isSkippedPermanently;

  return (
    <>
      <IconButton
        key="feedback-survey-toolbar-button"
        title="Share your feedback"
        aria-label="Share your feedback"
        onClick={handleOpen}
      >
        <IconWrapper>
          <SupportIcon />
          {showNotification && <NotificationDot />}
        </IconWrapper>
      </IconButton>

      <SurveyModal
        key={config.surveyId}
        isOpen={isOpen}
        config={config}
        isCompleted={storage.isCompleted}
        onSubmit={handleSubmit}
        onClose={handleClose}
        onSkipPermanent={handleSkipPermanent}
      />
    </>
  );
};
