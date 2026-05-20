import React from 'react';
import { ChoiceGroup, ChoiceInput, ChoiceRow } from '../ui/Choice';

interface CheckboxGroupInputProps {
  name: string;
  options: string[];
  values: string[];
  onChange: (option: string, checked: boolean) => void;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export const CheckboxGroupInput: React.FC<CheckboxGroupInputProps> = ({
  name,
  options,
  values = [],
  onChange,
  ariaDescribedBy,
  ariaInvalid,
}) => {
  return (
    <ChoiceGroup>
      {options.map((option, index) => {
        const isChecked = values.includes(option);
        return (
          <ChoiceRow key={option} htmlFor={`${name}-${index}`}>
            <ChoiceInput
              id={`${name}-${index}`}
              type="checkbox"
              checked={isChecked}
              onChange={(e) => onChange(option, e.target.checked)}
              aria-describedby={ariaDescribedBy}
              aria-invalid={ariaInvalid || undefined}
            />
            {option}
          </ChoiceRow>
        );
      })}
    </ChoiceGroup>
  );
};
