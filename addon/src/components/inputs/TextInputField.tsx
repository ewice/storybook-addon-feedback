import { Ref } from 'react';
import { styled } from 'storybook/theming';
import { inputBaseStyles } from '../../ui';

const InputText = styled.input(({ theme }) => ({
  ...inputBaseStyles(theme),
  minHeight: '36px'
}));

interface TextInputFieldProps {
  id: string;
  placeholder?: string;
  value: string;
  onChange: (text: string) => void;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  required?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export const TextInputField = ({
  id,
  placeholder,
  value,
  onChange,
  ariaDescribedBy,
  ariaInvalid,
  required,
  ref
}: TextInputFieldProps) => {
  return (
    <InputText
      ref={ref}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid || undefined}
      id={id}
      placeholder={placeholder}
      required={required}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
