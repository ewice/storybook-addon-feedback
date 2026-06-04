import { SurveyConfig } from './types';

declare global {
  const STORYBOOK_FEEDBACK_SURVEY_OPTIONS: Partial<SurveyConfig> | undefined;
}
