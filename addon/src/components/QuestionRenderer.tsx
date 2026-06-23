import { ReactNode, RefObject, memo } from 'react';
import { styled } from 'storybook/theming';
import type { SurveyField, SurveyFieldType, SurveyResponseValue } from '../types';
import { Field } from '../ui/Field';
import { Fieldset } from '../ui/Fieldset';
import { coerceValue } from '../utils/coercion';
import {
  CheckboxGroupInput,
  RadioGroupInput,
  StarRatingInput,
  TextAreaField,
  TextInputField
} from './inputs';

/** Styled empty-state for misconfigured or unknown question types */
const MisconfiguredWarning = styled.p(({ theme }) => ({
  margin: 0,
  padding: '8px 12px',
  fontSize: theme.typography.size.s1,
  color: theme.fgColor.negative,
  backgroundColor: theme.bgColor.negative,
  borderRadius: theme.appBorderRadius,
  fontStyle: 'italic'
}));

/** Type of wrapper element for each question type */
type WrapperType = 'fieldset' | 'field';

/** Common render-prop arguments passed into each renderer function */
interface RendererArgs {
  describedBy: string | undefined;
  invalid: boolean;
}

/** Shape of a renderer function in the registry */
type RendererFn = (
  coercedValue: SurveyResponseValue,
  args: RendererArgs,
  question: SurveyField,
  registerRef: (element: HTMLInputElement | HTMLTextAreaElement | null) => void,
  onChange: (fieldId: string, nextValue: SurveyResponseValue) => void,
  onCheckboxChange: (fieldId: string, option: string, checked: boolean) => void
) => ReactNode;

/** Registry entry: renderer function + wrapper type */
interface RendererEntry {
  wrapper: WrapperType;
  render: RendererFn;
}

/** The Renderer Registry — keyed by SurveyFieldType */
export const RENDERER_REGISTRY: Record<SurveyFieldType, RendererEntry> = {
  rating: {
    wrapper: 'fieldset',
    render: (value, { describedBy, invalid }, question, registerRef, onChange) => (
      <StarRatingInput
        ref={registerRef}
        name={question.id}
        value={value as number}
        onChange={(rating) => onChange(question.id, rating)}
        ariaDescribedBy={describedBy}
        ariaInvalid={invalid}
      />
    )
  },
  radio: {
    wrapper: 'fieldset',
    render: (value, { describedBy, invalid }, question, registerRef, onChange) => (
      <RadioGroupInput
        ref={registerRef}
        name={question.id}
        options={question.options!}
        value={value as string}
        onChange={(option) => onChange(question.id, option)}
        ariaDescribedBy={describedBy}
        ariaInvalid={invalid}
        direction={question.direction}
      />
    )
  },
  checkbox: {
    wrapper: 'fieldset',
    render: (
      value,
      { describedBy, invalid },
      question,
      registerRef,
      _onChange,
      onCheckboxChange
    ) => (
      <CheckboxGroupInput
        ref={registerRef}
        name={question.id}
        options={question.options!}
        values={value as string[]}
        onChange={(option, checked) => onCheckboxChange(question.id, option, checked)}
        ariaDescribedBy={describedBy}
        ariaInvalid={invalid}
        direction={question.direction}
      />
    )
  },
  text: {
    wrapper: 'field',
    render: (value, { describedBy, invalid }, question, registerRef, onChange) => (
      <TextInputField
        ref={registerRef}
        id={question.id}
        placeholder={question.placeholder}
        value={value as string}
        onChange={(text) => onChange(question.id, text)}
        ariaDescribedBy={describedBy}
        ariaInvalid={invalid}
        required={question.required}
      />
    )
  },
  textarea: {
    wrapper: 'field',
    render: (value, { describedBy, invalid }, question, registerRef, onChange) => (
      <TextAreaField
        ref={registerRef}
        id={question.id}
        placeholder={question.placeholder}
        value={value as string}
        onChange={(text) => onChange(question.id, text)}
        ariaDescribedBy={describedBy}
        ariaInvalid={invalid}
        required={question.required}
      />
    )
  }
};

interface QuestionRendererProps {
  question: SurveyField;
  value: SurveyResponseValue | undefined;
  error?: string;
  onChange: (fieldId: string, nextValue: SurveyResponseValue) => void;
  onCheckboxChange: (fieldId: string, option: string, checked: boolean) => void;
  fieldRefs: RefObject<Record<string, HTMLElement | null>>;
}

export const QuestionRenderer = memo(
  ({ question, value, error, onChange, onCheckboxChange, fieldRefs }: QuestionRendererProps) => {
    const { id, type, label, required } = question;

    const commonProps = { id, label, required, error };

    const registerRef = (element: HTMLInputElement | HTMLTextAreaElement | null) => {
      fieldRefs.current[id] = element;
    };

    if (
      (type === 'radio' || type === 'checkbox') &&
      (!question.options || question.options.length === 0)
    ) {
      return (
        <Fieldset {...commonProps}>
          {() => (
            <MisconfiguredWarning>
              Question &quot;{label}&quot; is misconfigured: no options provided.
            </MisconfiguredWarning>
          )}
        </Fieldset>
      );
    }

    const entry = RENDERER_REGISTRY[type];

    if (!entry) {
      return (
        <Fieldset {...commonProps}>
          {() => (
            <MisconfiguredWarning>
              Unsupported question type: &quot;{type}&quot;.
            </MisconfiguredWarning>
          )}
        </Fieldset>
      );
    }

    const coercedValue = coerceValue(type, value);

    const Wrapper = entry.wrapper === 'fieldset' ? Fieldset : Field;
    return (
      <Wrapper {...commonProps}>
        {({ describedBy, invalid }) =>
          entry.render(
            coercedValue,
            { describedBy, invalid },
            question,
            registerRef,
            onChange,
            onCheckboxChange
          )
        }
      </Wrapper>
    );
  }
);

QuestionRenderer.displayName = 'QuestionRenderer';
