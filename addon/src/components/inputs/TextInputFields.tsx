import React from 'react';
import { styled } from 'storybook/theming';
import { focusRing } from '../ui/styles';

const InputText = styled.input(({ theme }) => ({
  padding: '8px 12px',
  minHeight: '36px',
  fontSize: '13px',
  borderRadius: '4px',
  border: `1px solid ${theme.appBorderColor}`,
  backgroundColor: theme.background.app,
  color: theme.textColor,
  transition: 'border-color 0.2s, box-shadow 0.2s',
  '&:focus-visible': {
    borderColor: theme.barSelectedColor,
    ...focusRing(theme),
  },
}));

const TextArea = styled.textarea(({ theme }) => ({
  padding: '8px 12px',
  fontSize: '13px',
  borderRadius: '4px',
  border: `1px solid ${theme.appBorderColor}`,
  backgroundColor: theme.background.app,
  color: theme.color.primary,
  resize: 'vertical',
  minHeight: '80px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  '&:focus-visible': {
    borderColor: theme.barSelectedColor,
    ...focusRing(theme),
  },
}));

interface TextInputFieldProps {
  id: string;
  placeholder?: string;
  value: string;
  onChange: (text: string) => void;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  required?: boolean;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  id,
  placeholder,
  value,
  onChange,
  ariaDescribedBy,
  ariaInvalid,
  required,
}) => {
  return (
    <InputText
      type="text"
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid || undefined}
      required={required}
    />
  );
};

interface TextAreaFieldProps {
  id: string;
  placeholder?: string;
  value: string;
  onChange: (text: string) => void;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  required?: boolean;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  id,
  placeholder,
  value,
  onChange,
  ariaDescribedBy,
  ariaInvalid,
  required,
}) => {
  return (
    <TextArea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid || undefined}
      required={required}
    />
  );
};
