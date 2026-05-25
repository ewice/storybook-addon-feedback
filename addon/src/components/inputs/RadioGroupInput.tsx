import React from 'react';
import { Choice, ChoiceGroup, ChoiceInput } from '../../ui';

interface RadioGroupInputProps {
  name: string;
  options: string[];
  value: string;
  onChange: (option: string) => void;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  direction?: 'row' | 'column';
}

export const RadioGroupInput = React.forwardRef<HTMLInputElement, RadioGroupInputProps>(
  ({ ariaDescribedBy, ariaInvalid, direction, name, options, value, onChange }, ref) => {
    return (
      <ChoiceGroup direction={direction}>
        {options.map((option, index) => (
          <Choice key={option} htmlFor={`${name}-${index}`}>
            <ChoiceInput
              ref={index === 0 ? ref : undefined}
              aria-describedby={ariaDescribedBy}
              aria-invalid={ariaInvalid || undefined}
              checked={value === option}
              id={`${name}-${index}`}
              name={name}
              type="radio"
              onChange={() => onChange(option)}
            />
            {option}
          </Choice>
        ))}
      </ChoiceGroup>
    );
  }
);

RadioGroupInput.displayName = 'RadioGroupInput';
