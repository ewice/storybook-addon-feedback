import React from 'react';
import { addons, types, useParameter } from 'storybook/manager-api';
import { IconButton } from 'storybook/internal/components';
import { SupportIcon } from '@storybook/icons';
import { styled } from 'storybook/theming';
import { SurveyConfig } from './types';
import { SurveyModal } from './components/SurveyModal';
import { useSurveyStorage } from './hooks/useSurveyStorage';
import { useSurveyLifecycle } from './hooks/useSurveyLifecycle';
import { submitFeedbackWebhook } from './utils/api';

const ADDON_ID = 'storybook-feedback-survey';
const TOOL_ID = `${ADDON_ID}/tool`;

// Global options injected at build-time by preset.js
declare global {
  const STORYBOOK_FEEDBACK_SURVEY_OPTIONS: any;
}

// Styled toolbar elements
const IconWrapper = styled.div({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const NotificationDot = styled.div(({ theme }) => ({
  position: 'absolute',
  top: '2px',
  right: '2px',
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: theme.color.negative || '#FF4400',
}));

const SurveyManager: React.FC<{ api: any }> = ({ api }) => {
  // 1. Fetch configurations (Storybook parameters override build-time configs)
  const buildTimeOptions = typeof STORYBOOK_FEEDBACK_SURVEY_OPTIONS !== 'undefined'
    ? STORYBOOK_FEEDBACK_SURVEY_OPTIONS
    : {};

  const parameterOptions = useParameter<SurveyConfig | null>('feedbackSurvey', null);

  const config: SurveyConfig = {
    surveyId: 'default-survey-v1',
    title: 'Feedback Survey',
    description: 'Help us improve by sharing your thoughts!',
    questions: [],
    ...buildTimeOptions,
    ...parameterOptions,
  };

  // 2. Initialize Custom Storage Hook
  const storage = useSurveyStorage(config.surveyId);

  // 3. Initialize Custom Lifecycle Hook (supression rules, auto-delays, story nav, hotkeys)
  const { isOpen, setIsOpen, shouldBlockAutoPopup } = useSurveyLifecycle({
    config,
    isCompleted: storage.isCompleted,
    isSkippedPermanently: storage.isSkippedPermanently,
    dismissedAt: storage.dismissedAt,
    impressionCount: storage.impressionCount,
    incrementImpressions: storage.incrementImpressions,
    api,
  });

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Record temporary snooze timestamp if not completed
    if (!storage.isCompleted) {
      storage.setDismissed(Date.now());
    }
  };

  const handleSkipPermanent = () => {
    setIsOpen(false);
    storage.setSkippedPermanently();
  };

  const handleSubmit = async (responses: Record<string, any>) => {
    // Dispatch webhook transmission using our decoupled utility client
    const payload = await submitFeedbackWebhook(config, responses);

    // Emit Storybook Channel Event for in-browser ecosystem integration
    const channel = api.getChannel();
    channel.emit('feedback-survey/submitted', payload);

    console.log('[Feedback Survey Addon] Feedback submitted successfully:', payload);

    // Save completion state locally
    storage.setCompleted();
  };

  // Hide the toolbar button entirely if no questions are configured
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

addons.register(ADDON_ID, (api) => {
  addons.add(TOOL_ID, {
    title: 'Feedback Survey',
    type: types.TOOL,
    match: ({ viewMode }) => viewMode === 'story',
    render: () => <SurveyManager api={api} />,
  });
});
