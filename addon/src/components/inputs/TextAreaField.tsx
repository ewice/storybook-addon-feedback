import { FC } from 'react';
import { styled } from 'storybook/theming';
import { inputBaseStyles } from '../ui/styles';

const TextArea = styled.textarea(({ theme }) => ({
  ...inputBaseStyles(theme),
  resize: 'vertical',
  minHeight: '80px'
}));

interface TextAreaFieldProps {
  id: string;
  value: string;
  onChange: (text: string) => void;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  placeholder?: string;
  required?: boolean;
}

export const TextAreaField: FC<TextAreaFieldProps> = ({
  ariaDescribedBy,
  ariaInvalid,
  id,
  placeholder,
  required,
  value,
  onChange
}) => {
  return (
    <TextArea
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid || undefined}
      id={id}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
