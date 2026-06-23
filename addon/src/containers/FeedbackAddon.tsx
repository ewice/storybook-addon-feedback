import { SupportIcon } from '@storybook/icons';
import { FC, useMemo } from 'react';
import { Button } from 'storybook/internal/components';
import { useParameter, API } from 'storybook/manager-api';
import { styled } from 'storybook/theming';
import type { SurveyConfig, SurveyResponses } from '../types';
import { SurveyForm } from '../components/SurveyForm';
import { CHANNEL_EVENTS, DEFAULT_SURVEY_ID } from '../constants';
import { useSurveyLifecycle } from '../hooks/useSurveyLifecycle';
import { useSurveyStorage } from '../hooks/useSurveyStorage';
import { DialogSurface } from '../ui/DialogSurface';
import { submitFeedbackWebhook } from '../utils/api';

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
  backgroundColor: theme.color.negative
}));

interface FeedbackAddonProps {
  api: API;
}

export const FeedbackAddon: FC<FeedbackAddonProps> = ({ api }) => {
  const buildTimeOptions = useMemo(
    () =>
      typeof STORYBOOK_FEEDBACK_SURVEY_OPTIONS === 'undefined'
        ? undefined
        : STORYBOOK_FEEDBACK_SURVEY_OPTIONS,
    []
  );

  const parameterOptions = useParameter<SurveyConfig | null>('feedbackSurvey', null);

  const config: SurveyConfig = useMemo(
    () => ({
      surveyId: DEFAULT_SURVEY_ID,
      title: 'Feedback Survey',
      description: 'Help us improve by sharing your thoughts!',
      questions: [],
      ...buildTimeOptions,
      ...parameterOptions
    }),
    [buildTimeOptions, parameterOptions]
  );

  const storage = useSurveyStorage(config.surveyId, undefined, config.questions);

  const { isOpen, setIsOpen } = useSurveyLifecycle({
    config,
    persistence: storage,
    onStoryChange: (cb) => {
      api.on('storyChanged', cb);
      return () => api.off('storyChanged', cb);
    }
  });

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (!storage.state.isCompleted) {
      storage.actions.dismiss(Date.now());
    }
  };

  const handleSkipPermanent = () => {
    setIsOpen(false);
    storage.actions.skipPermanently();
  };

  const handleSubmit = async (responses: SurveyResponses) => {
    const payload = await submitFeedbackWebhook(config, responses);

    const channel = api.getChannel();
    if (channel) {
      channel.emit(CHANNEL_EVENTS.SUBMITTED, payload);
    }

    storage.actions.complete();
  };

  if (!config.questions || config.questions.length === 0) {
    return null;
  }

  const showNotification = !storage.state.isCompleted && !storage.state.isSkippedPermanently;

  return (
    <>
      <Button
        ariaLabel="Share your feedback"
        key="feedback-survey-toolbar-button"
        padding="small"
        size="small"
        tooltip="Share your feedback"
        variant="ghost"
        onClick={handleOpen}
      >
        <IconWrapper>
          <SupportIcon />
          {showNotification && <NotificationDot />}
        </IconWrapper>
      </Button>

      <DialogSurface
        isOpen={isOpen}
        title={config.title}
        description={config.description}
        onClose={handleClose}
      >
        <SurveyForm
          key={config.surveyId}
          config={config}
          isCompleted={storage.state.isCompleted}
          onSubmit={handleSubmit}
          onClose={handleClose}
          onSkipPermanent={handleSkipPermanent}
          getDraft={storage.draft.get}
          saveDraft={storage.draft.save}
          clearDraft={storage.draft.clear}
        />
      </DialogSurface>
    </>
  );
};
