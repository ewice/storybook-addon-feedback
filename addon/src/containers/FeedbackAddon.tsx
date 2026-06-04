import { FC } from 'react';
import { useParameter, API } from 'storybook/manager-api';
import { Button } from 'storybook/internal/components';
import { SupportIcon } from '@storybook/icons';
import { styled } from 'storybook/theming';
import { SurveyConfig, SurveyResponses } from '../types';
import { useSurveyStorage } from '../hooks/useSurveyStorage';
import { useSurveyLifecycle } from '../hooks/useSurveyLifecycle';
import { submitFeedbackWebhook } from '../utils/api';
import { CHANNEL_EVENTS } from '../constants';
import { DialogSurface } from '../ui/DialogSurface';
import { SurveyForm } from '../components/SurveyForm';

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
