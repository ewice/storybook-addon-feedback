import { Ref } from 'react';
import { Choice, ChoiceGroup, ChoiceInput } from '../../ui/Choice';

type ChoiceMode = 'radio' | 'checkbox';

interface ChoiceGroupPrimitiveProps {
  mode: ChoiceMode;
  name: string;
  options: string[];
  value: string | string[];
  onChange: (option: string, checked?: boolean) => void;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  direction?: 'row' | 'column';
  ref?: Ref<HTMLInputElement>;
}

export const ChoiceGroupPrimitive = ({
  mode,
  name,
  options,
  value,
  onChange,
  ariaDescribedBy,
  ariaInvalid,
  direction,
  ref
}: ChoiceGroupPrimitiveProps) => {
  return (
    <ChoiceGroup direction={direction}>
      {options.map((option, index) => {
        const isChecked =
          mode === 'radio' ? value === option : Array.isArray(value) && value.includes(option);

        return (
          <Choice key={option} htmlFor={`${name}-${index}`}>
            <ChoiceInput
              ref={index === 0 ? ref : undefined}
              aria-describedby={ariaDescribedBy}
              aria-invalid={ariaInvalid || undefined}
              checked={isChecked}
              id={`${name}-${index}`}
              name={mode === 'radio' ? name : undefined}
              type={mode}
              onChange={(event) => {
                if (mode === 'radio') {
                  onChange(option);
                } else {
                  onChange(option, event.target.checked);
                }
              }}
            />
            {option}
          </Choice>
        );
      })}
    </ChoiceGroup>
  );
};
