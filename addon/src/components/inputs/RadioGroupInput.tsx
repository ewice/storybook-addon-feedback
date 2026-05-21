import React from 'react';
import { ChoiceGroup, ChoiceInput, ChoiceRow } from '../ui/Choice';

interface RadioGroupInputProps {
  name: string;
  options: string[];
  value: string;
  onChange: (option: string) => void;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  direction?: 'row' | 'column';
}

export const RadioGroupInput: React.FC<RadioGroupInputProps> = ({
  ariaDescribedBy,
  ariaInvalid,
  direction,
  name,
  options,
  value,
  onChange,
}) => {
  return (
    <ChoiceGroup direction={direction}>
      {options.map((option, index) => (
        <ChoiceRow key={option} htmlFor={`${name}-${index}`}>
          <ChoiceInput
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid || undefined}
            checked={value === option}
            id={`${name}-${index}`}
            name={name}
            type="radio"
            onChange={() => onChange(option)}
          />
          {option}
        </ChoiceRow>
      ))}
    </ChoiceGroup>
  );
};
