# storybook-addon-feedback

A Storybook addon that displays a configurable feedback survey in the toolbar. Collect star ratings, multiple-choice answers, and free-text responses from your Storybook users — then forward them to any webhook endpoint.

**[Live Demo →](https://ewice.github.io/storybook-addon-feedback/)**

## Features

- **5 question types** — star rating, radio group, checkbox group, text input, textarea
- **Smart auto-popup** — trigger the survey after a time delay, after a number of story navigations, or both
- **Persistent state** — remembers completed/skipped/dismissed status across sessions via localStorage
- **Draft auto-save** — in-progress answers are saved to sessionStorage and restored on reopen
- **Webhook submission** — POST responses as JSON to any URL with configurable headers and timeout
- **Channel event** — emits a `feedback-survey/submitted` event so other addons or tools can react
- **Customizable copy** — override every UI string (buttons, error messages, thank-you screen)
- **Keyboard shortcut** — toggle the survey dialog with `Alt+Shift+S`
- **Cross-tab sync** — survey state updates propagate across browser tabs
- **Lifecycle controls** — max impressions, cooldown period after dismissal, expiration date, global enable/disable

## Installation

```bash
npm install storybook-addon-feedback
```

### Peer dependencies

| Package            | Version                              |
| ------------------ | ------------------------------------ |
| `storybook`        | `^10.0.0`                            |
| `react`            | `^16.8.0 \|\| ^17 \|\| ^18 \|\| ^19` |
| `react-dom`        | `^16.8.0 \|\| ^17 \|\| ^18 \|\| ^19` |
| `@storybook/icons` | `^2.0.0`                             |

## Setup

Register the addon in your `.storybook/main.ts`:

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['storybook-addon-feedback'],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  }
};
export default config;
```

The addon works with both Vite and Webpack Storybook setups.

## Configuration

Configure the survey via the `feedbackSurvey` parameter in `.storybook/preview.ts`:

```ts
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    feedbackSurvey: {
      surveyId: 'my-survey-v1',
      title: 'Help Us Improve!',
      description: 'Share your thoughts on our component docs.',
      webhookUrl: 'https://your-endpoint.example.com/feedback',
      trigger: {
        delayMs: 5000,
        storyCount: 3
      },
      questions: [
        {
          id: 'rating',
          type: 'rating',
          label: 'How would you rate the docs?',
          required: true
        },
        {
          id: 'ease',
          type: 'radio',
          label: 'Was it easy to find what you needed?',
          options: ['Very Easy', 'Somewhat Easy', 'Difficult'],
          required: true,
          direction: 'row'
        },
        {
          id: 'topics',
          type: 'checkbox',
          label: 'What would you like more of?',
          options: ['Code Examples', 'Accessibility Guides', 'Best Practices']
        },
        {
          id: 'comments',
          type: 'textarea',
          label: 'Any other feedback?'
        }
      ]
    }
  }
};
export default preview;
```

## Configuration reference

### `SurveyConfig`

| Property           | Type                      | Default                | Description                                                  |
| ------------------ | ------------------------- | ---------------------- | ------------------------------------------------------------ |
| `surveyId`         | `string`                  | `'default-survey-v1'`  | Unique identifier. Changing this resets all stored state.    |
| `title`            | `string`                  | `'Feedback Survey'`    | Dialog title.                                                |
| `description`      | `string?`                 | `'Help us improve...'` | Short intro shown below the title.                           |
| `questions`        | `SurveyField[]`           | `[]`                   | Questions to display. Survey is hidden when empty.           |
| `webhookUrl`       | `string?`                 | —                      | URL to POST responses to. Omit to only emit a channel event. |
| `webhookHeaders`   | `Record<string, string>?` | —                      | Extra headers sent with the webhook request.                 |
| `requestTimeoutMs` | `number?`                 | `10000`                | Webhook timeout in ms (min 1000, max 120000).                |
| `trigger`          | `SurveyTrigger?`          | —                      | Auto-popup behavior.                                         |
| `enabled`          | `boolean?`                | `true`                 | Set to `false` to disable the survey globally.               |
| `messages`         | `SurveyMessages?`         | —                      | Override UI strings.                                         |

### `SurveyField`

| Property      | Type                                                        | Description                                          |
| ------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| `id`          | `string`                                                    | Unique question identifier (used as response key).   |
| `type`        | `'rating' \| 'radio' \| 'checkbox' \| 'text' \| 'textarea'` | Question type.                                       |
| `label`       | `string`                                                    | Question text shown to the user.                     |
| `required`    | `boolean?`                                                  | Whether the field must be filled before submission.  |
| `options`     | `string[]?`                                                 | Choices for `radio` and `checkbox` types.            |
| `placeholder` | `string?`                                                   | Placeholder text for `text` and `textarea` types.    |
| `direction`   | `'row' \| 'column'?`                                        | Layout direction for `radio` and `checkbox` options. |

### `SurveyTrigger`

| Property         | Type      | Default | Description                                                                       |
| ---------------- | --------- | ------- | --------------------------------------------------------------------------------- |
| `delayMs`        | `number?` | `5000`  | Auto-open after this many milliseconds. Set to `0` to disable time-based trigger. |
| `storyCount`     | `number?` | `3`     | Auto-open after navigating to this many stories.                                  |
| `maxImpressions` | `number?` | —       | Stop showing after this many auto-popups.                                         |
| `coolDownDays`   | `number?` | —       | Days to wait before showing again after a dismissal.                              |
| `expiresAt`      | `string?` | —       | ISO date string after which the survey stops appearing.                           |

### `SurveyMessages`

Override any UI string:

| Key                 | Default                                            |
| ------------------- | -------------------------------------------------- |
| `selectOption`      | _"Please select at least one option."_             |
| `selectRating`      | _"Please select a rating."_                        |
| `requiredField`     | _"This field is required."_                        |
| `submissionFailure` | _"Failed to submit feedback. Please try again."_   |
| `skipPermanent`     | _"Don't show again"_                               |
| `cancel`            | _"Cancel"_                                         |
| `submitFeedback`    | _"Submit Feedback"_                                |
| `submitting`        | _"Submitting..."_                                  |
| `thankYouTitle`     | _"Thank you!"_                                     |
| `thankYouBody`      | _"Your feedback has been successfully submitted."_ |
| `thankYouClose`     | _"Close"_                                          |

## Webhook payload

When `webhookUrl` is configured, the addon sends a POST request with this JSON body:

```json
{
  "surveyId": "my-survey-v1",
  "timestamp": "2025-06-01T12:34:56.789Z",
  "responses": {
    "rating": 4,
    "ease": "Very Easy",
    "topics": ["Code Examples", "Best Practices"],
    "comments": "Great docs!"
  }
}
```

If no `webhookUrl` is set, the addon still emits the payload on the Storybook channel under the `feedback-survey/submitted` event. You can listen for it in another addon or decorator:

```ts
import { addons } from 'storybook/manager-api';

addons.register('my-listener', (api) => {
  const channel = api.getChannel();
  channel.on('feedback-survey/submitted', (payload) => {
    console.log('Feedback received:', payload);
  });
});
```

## How it works

The survey button appears in the Storybook toolbar (visible in story view mode). A notification dot indicates the survey hasn't been completed or permanently skipped.

**Auto-popup logic:**

1. After the configured `delayMs` timeout fires, _or_
2. After the user navigates to `storyCount` different stories

The survey won't auto-pop if any of these conditions are true:

- Already completed
- Permanently skipped ("Don't show again")
- Dismissed this session
- Within the cooldown period after a previous dismissal
- Max impressions reached
- Past the `expiresAt` date
- `enabled` is `false`

Users can always open the survey manually via the toolbar button or the `Alt+Shift+S` shortcut, regardless of auto-popup state.

## Per-story configuration

You can override the survey config for specific stories using story-level parameters:

```ts
export const MyStory = {
  parameters: {
    feedbackSurvey: {
      title: 'Rate this component',
      questions: [
        {
          id: 'component-rating',
          type: 'rating',
          label: 'How useful is this component?',
          required: true
        }
      ]
    }
  }
};
```

## License

MIT
