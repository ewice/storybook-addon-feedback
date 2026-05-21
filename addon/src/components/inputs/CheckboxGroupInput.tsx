import { FC } from 'react';
import { ChoiceGroup, ChoiceInput, ChoiceRow } from '../ui/Choice';

interface CheckboxGroupInputProps {
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  direction?: 'row' | 'column';
  name: string;
  options: string[];
  values: string[];
  onChange: (option: string, checked: boolean) => void;
}

export const CheckboxGroupInput: FC<CheckboxGroupInputProps> = ({
  ariaDescribedBy,
  ariaInvalid,
  direction,
  name,
  options,
  values = [],
  onChange,
}) => {
  return (
    <ChoiceGroup direction={direction}>
      {options.map((option, index) => {
        const isChecked = values.includes(option);

        return (
          <ChoiceRow key={option} htmlFor={`${name}-${index}`}>
            <ChoiceInput
              aria-describedby={ariaDescribedBy}
              aria-invalid={ariaInvalid || undefined}
              checked={isChecked}
              id={`${name}-${index}`}
              type="checkbox"
              onChange={(e) => onChange(option, e.target.checked)}
            />
            {option}
          </ChoiceRow>
        );
      })}
    </ChoiceGroup>
  );
};
