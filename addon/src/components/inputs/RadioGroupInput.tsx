import React from 'react';
import { ChoiceGroup, ChoiceInput, ChoiceRow } from '../ui/Choice';

interface RadioGroupInputProps {
  name: string;
  options: string[];
  value: string;
  onChange: (option: string) => void;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export const RadioGroupInput: React.FC<RadioGroupInputProps> = ({
  name,
  options,
  value,
  onChange,
  ariaDescribedBy,
  ariaInvalid,
}) => {
  return (
    <ChoiceGroup>
      {options.map((option, index) => (
        <ChoiceRow key={option} htmlFor={`${name}-${index}`}>
          <ChoiceInput
            id={`${name}-${index}`}
            type="radio"
            name={name}
            checked={value === option}
            onChange={() => onChange(option)}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid || undefined}
          />
          {option}
        </ChoiceRow>
      ))}
    </ChoiceGroup>
  );
};
