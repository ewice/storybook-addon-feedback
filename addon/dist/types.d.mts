type SurveyFieldType = 'rating' | 'radio' | 'checkbox' | 'text' | 'textarea';
interface SurveyField {
    id: string;
    type: SurveyFieldType;
    label: string;
    required?: boolean;
    options?: string[];
    placeholder?: string;
}
interface SurveyTrigger {
    delayMs?: number;
    storyCount?: number;
    maxImpressions?: number;
    coolDownDays?: number;
    expiresAt?: string;
}
interface SurveyConfig {
    surveyId: string;
    title: string;
    description?: string;
    questions: SurveyField[];
    webhookUrl?: string;
    webhookHeaders?: Record<string, string>;
    trigger?: SurveyTrigger;
    enabled?: boolean;
}

export type { SurveyConfig, SurveyField, SurveyFieldType, SurveyTrigger };
