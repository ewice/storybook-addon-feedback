import { FC } from 'react';
import { SurveyConfig, SurveyResponses } from '../types';
import { SurveyForm } from './SurveyForm';
import { DialogSurface } from '../ui';

interface SurveyModalProps {
  isOpen: boolean;
  config: SurveyConfig;
  isCompleted: boolean;
  onSubmit: (data: SurveyResponses) => Promise<void>;
  onClose: () => void;
  onSkipPermanent: () => void;
}

export const SurveyModal: FC<SurveyModalProps> = ({
  isOpen,
  config,
  isCompleted,
  onSubmit,
  onClose,
  onSkipPermanent
}) => (
  <DialogSurface
    isOpen={isOpen}
    title={config.title}
    description={config.description}
    onClose={onClose}
  >
    <SurveyForm
      key={config.surveyId}
      config={config}
      isCompleted={isCompleted}
      onSubmit={onSubmit}
      onClose={onClose}
      onSkipPermanent={onSkipPermanent}
    />
  </DialogSurface>
);
