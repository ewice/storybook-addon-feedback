import React from 'react';
import { styled } from 'storybook/theming';
import { inputBaseStyles } from '../../ui';

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

export const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ ariaDescribedBy, ariaInvalid, id, placeholder, required, value, onChange }, ref) => {
    return (
      <TextArea
        ref={ref}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid || undefined}
        id={id}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
);

TextAreaField.displayName = 'TextAreaField';
