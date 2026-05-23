import React from 'react';
import { SurveyConfig } from '../types';
import { SurveyForm } from './SurveyForm';
import { DialogSurface } from './ui/DialogSurface';

interface SurveyModalProps {
  isOpen: boolean;
  config: SurveyConfig;
  isCompleted: boolean;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onClose: () => void;
  onSkipPermanent: () => void;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({
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
