import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { ThemeProvider, convert, themes } from 'storybook/theming';
import { describe, it, expect, vi } from 'vite-plus/test';
import type { SurveyField } from '../types';
import { QuestionRenderer } from './QuestionRenderer';

const theme = convert(themes.light);

function renderWithTheme(element: ReactNode) {
  return render(<ThemeProvider theme={theme}>{element}</ThemeProvider>);
}

describe('QuestionRenderer', () => {
  const defaultProps = {
    value: undefined,
    error: undefined,
    onChange: vi.fn(),
    onCheckboxChange: vi.fn(),
    fieldRefs: { current: {} } as React.RefObject<Record<string, HTMLElement | null>>
  };

  it('renders star rating inputs for rating type', () => {
    const question: SurveyField = {
      id: 'rating-q',
      type: 'rating',
      label: 'Rate your experience'
    };

    renderWithTheme(<QuestionRenderer question={question} {...defaultProps} />);

    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(5);
  });

  it('renders radio group inputs for radio type', () => {
    const question: SurveyField = {
      id: 'radio-q',
      type: 'radio',
      label: 'Pick one',
      options: ['Option A', 'Option B', 'Option C']
    };

    renderWithTheme(<QuestionRenderer question={question} {...defaultProps} />);

    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(3);
  });

  it('renders checkbox inputs for checkbox type', () => {
    const question: SurveyField = {
      id: 'checkbox-q',
      type: 'checkbox',
      label: 'Select all that apply',
      options: ['Alpha', 'Beta']
    };

    renderWithTheme(<QuestionRenderer question={question} {...defaultProps} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(2);
  });

  it('renders a text input for text type', () => {
    const question: SurveyField = {
      id: 'text-q',
      type: 'text',
      label: 'Your name'
    };

    renderWithTheme(<QuestionRenderer question={question} {...defaultProps} />);

    const textInput = screen.getByRole('textbox');
    expect(textInput).toBeDefined();
    expect(textInput.getAttribute('type')).toBe('text');
  });

  it('renders a textarea for textarea type', () => {
    const question: SurveyField = {
      id: 'textarea-q',
      type: 'textarea',
      label: 'Additional comments'
    };

    renderWithTheme(<QuestionRenderer question={question} {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDefined();
    expect(textarea.tagName.toLowerCase()).toBe('textarea');
  });
});

import fc from 'fast-check';
import type { SurveyFieldType, SurveyResponseValue } from '../types';
import { coerceValue } from '../utils/coercion';
import { RENDERER_REGISTRY } from './QuestionRenderer';

describe('RENDERER_REGISTRY - Property 13: Registry dispatch completeness', () => {
  const supportedTypes: SurveyFieldType[] = ['rating', 'radio', 'checkbox', 'text', 'textarea'];

  it('has a non-null entry with wrapper and render for every supported type', () => {
    fc.assert(
      fc.property(fc.constantFrom(...supportedTypes), (type) => {
        const entry = RENDERER_REGISTRY[type];
        expect(entry).not.toBeNull();
        expect(entry).not.toBeUndefined();
        expect(entry.wrapper).toMatch(/^(fieldset|field)$/);
        expect(typeof entry.render).toBe('function');
      }),
      { numRuns: 100 }
    );
  });
});

describe('coerceValue - Property 14: coerceValue is total and idempotent', () => {
  const supportedTypes: SurveyFieldType[] = ['rating', 'radio', 'checkbox', 'text', 'textarea'];

  const anyValueArb = fc.oneof(
    fc.integer(),
    fc.double({ noNaN: true }),
    fc.string(),
    fc.array(fc.string()),
    fc.constant(undefined)
  );

  it('returns the expected runtime type for any input', () => {
    fc.assert(
      fc.property(fc.constantFrom(...supportedTypes), anyValueArb, (type, value) => {
        const result = coerceValue(type, value as SurveyResponseValue | undefined);
        switch (type) {
          case 'rating':
            expect(typeof result).toBe('number');
            break;
          case 'radio':
          case 'text':
          case 'textarea':
            expect(typeof result).toBe('string');
            break;
          case 'checkbox':
            expect(Array.isArray(result)).toBe(true);
            break;
        }
      }),
      { numRuns: 100 }
    );
  });

  it('is idempotent: re-coercing produces the same result', () => {
    fc.assert(
      fc.property(fc.constantFrom(...supportedTypes), anyValueArb, (type, value) => {
        const once = coerceValue(type, value as SurveyResponseValue | undefined);
        const twice = coerceValue(type, once);
        expect(twice).toEqual(once);
      }),
      { numRuns: 100 }
    );
  });
});

describe('QuestionRenderer - Misconfigured/Unknown type handling', () => {
  const defaultProps = {
    value: undefined,
    error: undefined,
    onChange: vi.fn(),
    onCheckboxChange: vi.fn(),
    fieldRefs: { current: {} } as React.RefObject<Record<string, HTMLElement | null>>
  };

  it('renders empty-state for radio with empty options', () => {
    const question: SurveyField = {
      id: 'radio-empty',
      type: 'radio',
      label: 'Bad radio',
      options: []
    };
    renderWithTheme(<QuestionRenderer question={question} {...defaultProps} />);
    expect(screen.getByText(/is misconfigured: no options provided/)).toBeDefined();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('renders empty-state for checkbox with absent options', () => {
    const question: SurveyField = {
      id: 'checkbox-none',
      type: 'checkbox',
      label: 'Bad checkbox'
      // options intentionally omitted
    };
    renderWithTheme(<QuestionRenderer question={question} {...defaultProps} />);
    expect(screen.getByText(/is misconfigured: no options provided/)).toBeDefined();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('renders empty-state for unsupported type', () => {
    const question = {
      id: 'unknown-q',
      type: 'dropdown' as unknown as SurveyFieldType,
      label: 'Unknown type'
    } as SurveyField;
    renderWithTheme(<QuestionRenderer question={question} {...defaultProps} />);
    expect(screen.getByText(/Unsupported question type/)).toBeDefined();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('radio')).toBeNull();
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('renders text input only for text type (no fall-through)', () => {
    const question: SurveyField = {
      id: 'text-q2',
      type: 'text',
      label: 'Name'
    };
    renderWithTheme(<QuestionRenderer question={question} {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeDefined();
    expect(screen.queryByRole('radio')).toBeNull();
    expect(screen.queryByRole('checkbox')).toBeNull();
  });
});
