export type SurveyFieldType = 'rating' | 'radio' | 'checkbox' | 'text' | 'textarea';

export interface SurveyField {
  id: string;
  type: SurveyFieldType;
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  direction?: 'row' | 'column';
}

export interface SurveyTrigger {
  delayMs?: number;
  storyCount?: number;
  maxImpressions?: number;
  coolDownDays?: number;
  expiresAt?: string;
}

export interface SurveyMessages {
  selectOption?: string;
  selectRating?: string;
  requiredField?: string;
  submissionFailure?: string;
  skipPermanent?: string;
  cancel?: string;
  submitFeedback?: string;
  submitting?: string;
  thankYouTitle?: string;
  thankYouBody?: string;
  thankYouClose?: string;
}

export interface SurveyConfig {
  surveyId: string;
  title: string;
  description?: string;
  questions: SurveyField[];
  webhookUrl?: string;
  webhookHeaders?: Record<string, string>;
  trigger?: SurveyTrigger;
  enabled?: boolean;
  requestTimeoutMs?: number;
  messages?: SurveyMessages;
}

export type SurveyResponseValue = string | number | string[];

export type SurveyResponses = Record<string, SurveyResponseValue>;
