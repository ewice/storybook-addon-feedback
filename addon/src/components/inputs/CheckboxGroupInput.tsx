import { Ref } from 'react';
import { ChoiceGroupPrimitive } from './ChoiceGroupPrimitive';

interface CheckboxGroupInputProps {
  name: string;
  options: string[];
  values: string[];
  onChange: (option: string, checked: boolean) => void;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  direction?: 'row' | 'column';
  ref?: Ref<HTMLInputElement>;
}

export const CheckboxGroupInput = ({
  name,
  options,
  values,
  onChange,
  ariaDescribedBy,
  ariaInvalid,
  direction,
  ref
}: CheckboxGroupInputProps) => (
  <ChoiceGroupPrimitive
    mode="checkbox"
    name={name}
    options={options}
    value={values}
    onChange={(option, checked) => onChange(option, checked === true)}
    ariaDescribedBy={ariaDescribedBy}
    ariaInvalid={ariaInvalid}
    direction={direction}
    ref={ref}
  />
);
