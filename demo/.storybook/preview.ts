import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    feedbackSurvey: {
      surveyId: 'doc-feedback-survey-v1',
      title: 'Help Us Improve Our Docs!',
      description:
        'We would love to get your feedback on our component documentation and guidelines.',
      webhookUrl:
        ((import.meta as any).env && (import.meta as any).env.STORYBOOK_FEEDBACK_WEBHOOK_URL) ||
        (typeof (globalThis as any).process !== 'undefined' &&
          (globalThis as any).process.env.STORYBOOK_FEEDBACK_WEBHOOK_URL) ||
        'https://httpbin.org/post', // Fallback for local testing
      trigger: {
        delayMs: 5000, // Pop up after 5 seconds
        storyCount: 3 // Or after visiting 3 stories
      },
      questions: [
        {
          id: 'rating',
          type: 'rating',
          label: 'How would you rate the clarity of our component docs?',
          required: true
        },
        {
          id: 'clarity-radio',
          type: 'radio',
          label: 'Was it easy to find what you were looking for?',
          options: ['Very Easy', 'Somewhat Easy', 'Difficult'],
          required: true,
          direction: 'row'
        },
        {
          id: 'missing-content',
          type: 'checkbox',
          label: 'What topics would you like to see more of? (Select all that apply)',
          options: ['Code Examples', 'Accessibility Guides', 'Design Specs', 'Best Practices']
        },
        {
          id: 'additional-feedback',
          type: 'textarea',
          label: 'Any other comments or suggestions?',
          required: false
        }
      ]
    }
  }
};

export default preview;
