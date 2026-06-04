// Addon identity
export const ADDON_ID = 'storybook-feedback-survey';
export const TOOL_ID = `${ADDON_ID}/tool`;

// Channel events
export const CHANNEL_EVENTS = {
  SUBMITTED: 'feedback-survey/submitted'
} as const;

// Default trigger values
export const DEFAULT_DELAY_MS = 5000;
export const DEFAULT_STORY_COUNT = 3;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

const STORAGE_VERSION = 'v1';

// Storage key prefixes (namespaced, versionable)
export const STORAGE_KEYS = {
  completed: (id: string) => `sb-survey-${STORAGE_VERSION}-completed-${id}`,
  skippedPermanently: (id: string) => `sb-survey-${STORAGE_VERSION}-skipped-${id}`,
  dismissedAt: (id: string) => `sb-survey-${STORAGE_VERSION}-dismissed-at-${id}`,
  sessionDismissed: (id: string) => `sb-survey-${STORAGE_VERSION}-session-dismissed-${id}`,
  impressionCount: (id: string) => `sb-survey-${STORAGE_VERSION}-impressions-${id}`,
  draft: (id: string) => `sb-survey-${STORAGE_VERSION}-draft-${id}`
} as const;
