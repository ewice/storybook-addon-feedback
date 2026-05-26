import { Ref } from 'react';
import { Choice, ChoiceGroup, ChoiceInput } from '../../ui';

interface CheckboxGroupInputProps {
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  direction?: 'row' | 'column';
  name: string;
  options: string[];
  values: string[];
  onChange: (option: string, checked: boolean) => void;
  ref?: Ref<HTMLInputElement>;
}

export const CheckboxGroupInput = ({
  ariaDescribedBy,
  ariaInvalid,
  direction,
  name,
  options,
  values = [],
  onChange,
  ref
}: CheckboxGroupInputProps) => {
  return (
    <ChoiceGroup direction={direction}>
      {options.map((option, index) => {
        const isChecked = values.includes(option);

        return (
          <Choice key={option} htmlFor={`${name}-${index}`}>
            <ChoiceInput
              ref={index === 0 ? ref : undefined}
              aria-describedby={ariaDescribedBy}
              aria-invalid={ariaInvalid || undefined}
              checked={isChecked}
              id={`${name}-${index}`}
              type="checkbox"
              onChange={(e) => onChange(option, e.target.checked)}
            />
            {option}
          </Choice>
        );
      })}
    </ChoiceGroup>
  );
};
