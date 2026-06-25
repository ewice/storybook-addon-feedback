export const ADDON_ID = 'storybook-addon-feedback';
export const TOOL_ID = `${ADDON_ID}/tool`;

export const CHANNEL_EVENTS = {
  SUBMITTED: 'feedback-survey/submitted'
} as const;

export const DEFAULT_DELAY_MS = 5000;
export const DEFAULT_STORY_COUNT = 3;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

const STORAGE_VERSION = 'v1';

export const STORAGE_KEYS = {
  completed: (id: string) => `sb-survey-${STORAGE_VERSION}-completed-${id}`,
  skippedPermanently: (id: string) => `sb-survey-${STORAGE_VERSION}-skipped-${id}`,
  dismissedAt: (id: string) => `sb-survey-${STORAGE_VERSION}-dismissed-at-${id}`,
  sessionDismissed: (id: string) => `sb-survey-${STORAGE_VERSION}-session-dismissed-${id}`,
  impressionCount: (id: string) => `sb-survey-${STORAGE_VERSION}-impressions-${id}`,
  draft: (id: string) => `sb-survey-${STORAGE_VERSION}-draft-${id}`
} as const;

export const DEFAULT_SURVEY_ID = 'default-survey-v1';

export const KEYBOARD_SHORTCUT = 'Alt+Shift+S';

export const DEFAULT_WEBHOOK_TIMEOUT_MS = 10000;
export const MIN_WEBHOOK_TIMEOUT_MS = 1000;
export const MAX_WEBHOOK_TIMEOUT_MS = 120000;

export const MAX_STAR_RATING = 5;
