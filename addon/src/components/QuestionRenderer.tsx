import { FC, MutableRefObject } from 'react';
import { SurveyField, SurveyResponseValue } from '../types';
import {
  CheckboxGroupInput,
  RadioGroupInput,
  StarRatingInput,
  TextInputField,
  TextAreaField
} from './inputs';
import { Field, Fieldset } from '../ui';

interface QuestionRendererProps {
  question: SurveyField;
  value: SurveyResponseValue | undefined;
  error?: string;
  onChange: (fieldId: string, nextValue: SurveyResponseValue) => void;
  onCheckboxChange: (fieldId: string, option: string, checked: boolean) => void;
  fieldRefs: MutableRefObject<Record<string, HTMLElement | null>>;
}

export const QuestionRenderer: FC<QuestionRendererProps> = ({
  question,
  value,
  error,
  onChange,
  onCheckboxChange,
  fieldRefs
}) => {
  const { id, type, label, required, options, placeholder, direction } = question;

  const commonProps = {
    id,
    label,
    required,
    error
  };

  const registerRef = (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    fieldRefs.current[id] = el;
  };

  if (type === 'rating') {
    return (
      <Fieldset key={id} {...commonProps}>
        {({ describedBy, invalid }) => (
          <StarRatingInput
            ref={registerRef}
            name={id}
            value={typeof value === 'number' ? value : 0}
            onChange={(rating) => onChange(id, rating)}
            ariaDescribedBy={describedBy}
            ariaInvalid={invalid}
          />
        )}
      </Fieldset>
    );
  }

  if (type === 'radio' && options) {
    return (
      <Fieldset key={id} {...commonProps}>
        {({ describedBy, invalid }) => (
          <RadioGroupInput
            ref={registerRef}
            name={id}
            options={options}
            value={typeof value === 'string' ? value : ''}
            onChange={(option) => onChange(id, option)}
            ariaDescribedBy={describedBy}
            ariaInvalid={invalid}
            direction={direction}
          />
        )}
      </Fieldset>
    );
  }

  if (type === 'checkbox' && options) {
    return (
      <Fieldset key={id} {...commonProps}>
        {({ describedBy, invalid }) => (
          <CheckboxGroupInput
            ref={registerRef}
            name={id}
            options={options}
            values={Array.isArray(value) ? value : []}
            onChange={(option, checked) => onCheckboxChange(id, option, checked)}
            ariaDescribedBy={describedBy}
            ariaInvalid={invalid}
            direction={direction}
          />
        )}
      </Fieldset>
    );
  }

  if (type === 'textarea') {
    return (
      <Field key={id} {...commonProps}>
        {({ describedBy, invalid }) => (
          <TextAreaField
            ref={registerRef}
            id={id}
            placeholder={placeholder}
            value={typeof value === 'string' ? value : ''}
            onChange={(text) => onChange(id, text)}
            ariaDescribedBy={describedBy}
            ariaInvalid={invalid}
            required={required}
          />
        )}
      </Field>
    );
  }

  return (
    <Field key={id} {...commonProps}>
      {({ describedBy, invalid }) => (
        <TextInputField
          ref={registerRef}
          id={id}
          placeholder={placeholder}
          value={typeof value === 'string' ? value : ''}
          onChange={(text) => onChange(id, text)}
          ariaDescribedBy={describedBy}
          ariaInvalid={invalid}
          required={required}
        />
      )}
    </Field>
  );
};
