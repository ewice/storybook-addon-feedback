export type SurveyFieldType = 'rating' | 'radio' | 'checkbox' | 'text' | 'textarea';

export interface SurveyField {
  id: string;
  type: SurveyFieldType;
  label: string;
  required?: boolean;
  options?: string[]; // For radio and checkbox
  placeholder?: string; // For text and textarea
  direction?: 'row' | 'column'; // Visual orientation for radio/checkbox groups
}

export interface SurveyTrigger {
  delayMs?: number; // Time delay before popping up
  storyCount?: number; // Navigation count before popping up
  maxImpressions?: number; // Stop auto-popping after N impressions
  coolDownDays?: number; // Days to snooze survey when closed temporarily
  expiresAt?: string; // ISO date string (e.g., '2026-12-31') after which survey is disabled
}

export interface SurveyConfig {
  surveyId: string;
  title: string;
  description?: string;
  questions: SurveyField[];
  webhookUrl?: string;
  webhookHeaders?: Record<string, string>; // Custom and security authorization headers
  trigger?: SurveyTrigger;
  enabled?: boolean; // Global survey toggle
}
