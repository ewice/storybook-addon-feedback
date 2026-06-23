/**
 * All user-facing copy for the addon — validation errors and UI labels.
 * Centralizing strings here makes future localization straightforward.
 */

/** Validation error messages shown when required fields are incomplete. */
export const MESSAGES = {
  selectOption: 'Please select at least one option.',
  selectRating: 'Please select a rating.',
  requiredField: 'This field is required.',
  submissionFailure: 'Failed to submit feedback. Please try again.'
} as const;

/** UI labels used by presentational components (buttons, headings, etc.). */
export const COMPONENT_MESSAGES = {
  skipPermanent: "Don't show again",
  cancel: 'Cancel',
  submitFeedback: 'Submit Feedback',
  submitting: 'Submitting...',
  thankYouTitle: 'Thank you!',
  thankYouBody: 'Your feedback has been successfully submitted.',
  thankYouClose: 'Close'
} as const;

/**
 * Resolves a user-facing message: a non-empty, non-whitespace override wins;
 * otherwise the centralized default is used.
 */
export const resolveMessage = (override: string | undefined, fallback: string): string =>
  override && override.trim() !== '' ? override : fallback;
