import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { ThemeProvider, convert, themes } from 'storybook/theming';
import { describe, it, expect, vi } from 'vite-plus/test';
import type { SurveyConfig, SurveyResponses } from '../types';
import { SurveyForm } from './SurveyForm';

const theme = convert(themes.light);

function renderWithTheme(element: ReactNode) {
  return render(<ThemeProvider theme={theme}>{element}</ThemeProvider>);
}

const threeQuestionConfig: SurveyConfig = {
  surveyId: 'test-survey',
  title: 'Test Survey',
  questions: [
    { id: 'q-rating', type: 'rating', label: 'Rate your experience', required: true },
    { id: 'q-text', type: 'text', label: 'Your name', required: true },
    {
      id: 'q-checkbox',
      type: 'checkbox',
      label: 'Select topics',
      required: true,
      options: ['Docs', 'API', 'UI']
    }
  ]
};

function createMockProps(
  overrides: Partial<{
    config: SurveyConfig;
    isCompleted: boolean;
    onSubmit: (data: SurveyResponses) => Promise<void>;
    onClose: () => void;
    onSkipPermanent: () => void;
    getDraft: () => SurveyResponses;
    saveDraft: (values: SurveyResponses) => void;
    clearDraft: () => void;
  }> = {}
) {
  return {
    config: threeQuestionConfig,
    isCompleted: false,
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
    onSkipPermanent: vi.fn(),
    getDraft: vi.fn().mockReturnValue({}),
    saveDraft: vi.fn(),
    clearDraft: vi.fn(),
    ...overrides
  };
}

describe('SurveyForm', () => {
  it('renders one element per configured question', () => {
    const props = createMockProps();

    renderWithTheme(<SurveyForm {...props} />);

    expect(screen.getByText('Rate your experience')).toBeDefined();
    expect(screen.getByText('Your name')).toBeDefined();
    expect(screen.getByText('Select topics')).toBeDefined();

    const fieldsets = document.querySelectorAll('fieldset');
    expect(fieldsets.length).toBe(2);

    const textInput = screen.getByRole('textbox');
    expect(textInput).toBeDefined();
  });

  it('error summary appears on validation failure', async () => {
    const props = createMockProps();

    renderWithTheme(<SurveyForm {...props} />);

    const submitButton = screen.getByRole('button', { name: 'Submit Feedback' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThanOrEqual(1);
      const summaryAlert = alerts.find((alert) =>
        alert.textContent?.includes('Please review the highlighted fields')
      );
      expect(summaryAlert).toBeDefined();
    });
  });

  it('error summary absent when no errors', () => {
    const validDraft: SurveyResponses = {
      'q-rating': 4,
      'q-text': 'Alice',
      'q-checkbox': ['Docs']
    };
    const props = createMockProps({
      getDraft: vi.fn().mockReturnValue(validDraft)
    });

    renderWithTheme(<SurveyForm {...props} />);

    const alerts = screen.queryAllByRole('alert');
    expect(alerts.length).toBe(0);
  });

  it('submission invokes onSubmit exactly once with collected responses', async () => {
    const validDraft: SurveyResponses = {
      'q-rating': 5,
      'q-text': 'Bob',
      'q-checkbox': ['API', 'UI']
    };
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const props = createMockProps({
      getDraft: vi.fn().mockReturnValue(validDraft),
      onSubmit
    });

    renderWithTheme(<SurveyForm {...props} />);

    const submitButton = screen.getByRole('button', { name: 'Submit Feedback' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit).toHaveBeenCalledWith(validDraft);
  });

  it('thank-you view replaces the form after submission', async () => {
    const validDraft: SurveyResponses = {
      'q-rating': 3,
      'q-text': 'Carol',
      'q-checkbox': ['Docs']
    };
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const props = createMockProps({
      getDraft: vi.fn().mockReturnValue(validDraft),
      onSubmit
    });

    renderWithTheme(<SurveyForm {...props} />);

    const submitButton = screen.getByRole('button', { name: 'Submit Feedback' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Thank you!')).toBeDefined();
    });

    expect(screen.queryByRole('button', { name: 'Submit Feedback' })).toBeNull();
  });
});

import fc from 'fast-check';
import { COMPONENT_MESSAGES, resolveMessage } from '../utils/messages';

describe('Component strings - Property 19: Component-string override resolution', () => {
  const componentKeys = Object.keys(COMPONENT_MESSAGES) as (keyof typeof COMPONENT_MESSAGES)[];

  it('non-whitespace override wins over the default', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...componentKeys),
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (key, override) => {
          const result = resolveMessage(override, COMPONENT_MESSAGES[key]);
          expect(result).toBe(override);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty/whitespace/absent override yields the default', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...componentKeys),
        fc.oneof(
          fc.constant(undefined),
          fc.constant(''),
          fc
            .array(fc.constantFrom(' ', '\t', '\n'), { minLength: 1, maxLength: 10 })
            .map((chars) => chars.join(''))
        ),
        (key, override) => {
          const result = resolveMessage(override, COMPONENT_MESSAGES[key]);
          expect(result).toBe(COMPONENT_MESSAGES[key]);
        }
      ),
      { numRuns: 100 }
    );
  });
});

import { SurveyThankYou } from './SurveyThankYou';

describe('Component-string overrides - Integration', () => {
  it('SurveyForm renders overridden button labels from config.messages', () => {
    const config: SurveyConfig = {
      surveyId: 'test-override',
      title: 'Override Test',
      questions: [],
      messages: {
        skipPermanent: 'Never show',
        cancel: 'Dismiss',
        submitFeedback: 'Send'
      }
    };
    const props = createMockProps({ config });
    renderWithTheme(<SurveyForm {...props} />);

    expect(screen.getByRole('button', { name: 'Never show' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Send' })).toBeDefined();
  });

  it('SurveyForm renders default labels when no messages overrides provided', () => {
    const config: SurveyConfig = {
      surveyId: 'test-defaults',
      title: 'Default Test',
      questions: []
    };
    const props = createMockProps({ config });
    renderWithTheme(<SurveyForm {...props} />);

    expect(screen.getByRole('button', { name: COMPONENT_MESSAGES.skipPermanent })).toBeDefined();
    expect(screen.getByRole('button', { name: COMPONENT_MESSAGES.cancel })).toBeDefined();
    expect(screen.getByRole('button', { name: COMPONENT_MESSAGES.submitFeedback })).toBeDefined();
  });

  it('SurveyThankYou renders overridden strings from messages prop', () => {
    renderWithTheme(
      <SurveyThankYou
        onClose={() => {}}
        messages={{
          thankYouTitle: 'Merci!',
          thankYouBody: 'Votre feedback est enregistré.',
          thankYouClose: 'Fermer'
        }}
      />
    );

    expect(screen.getByText('Merci!')).toBeDefined();
    expect(screen.getByText('Votre feedback est enregistré.')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeDefined();
  });

  it('SurveyThankYou renders default strings when no messages provided', () => {
    renderWithTheme(<SurveyThankYou onClose={() => {}} />);

    expect(screen.getByText(COMPONENT_MESSAGES.thankYouTitle)).toBeDefined();
    expect(screen.getByText(COMPONENT_MESSAGES.thankYouBody)).toBeDefined();
    expect(screen.getByRole('button', { name: COMPONENT_MESSAGES.thankYouClose })).toBeDefined();
  });
});
