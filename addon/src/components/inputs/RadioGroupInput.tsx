import { Ref } from 'react';
import { ChoiceGroupPrimitive } from './ChoiceGroupPrimitive';

interface RadioGroupInputProps {
  name: string;
  options: string[];
  value: string;
  onChange: (option: string) => void;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  direction?: 'row' | 'column';
  ref?: Ref<HTMLInputElement>;
}

export const RadioGroupInput = ({
  name,
  options,
  value,
  onChange,
  ariaDescribedBy,
  ariaInvalid,
  direction,
  ref
}: RadioGroupInputProps) => (
  <ChoiceGroupPrimitive
    mode="radio"
    name={name}
    options={options}
    value={value}
    onChange={onChange}
    ariaDescribedBy={ariaDescribedBy}
    ariaInvalid={ariaInvalid}
    direction={direction}
    ref={ref}
  />
);
