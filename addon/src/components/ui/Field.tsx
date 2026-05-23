import React from 'react';
import { styled } from 'storybook/theming';
import { fieldTextStyles } from './styles';

const FieldContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
});

const Label = styled.label(({ theme }) => ({
  ...fieldTextStyles(theme),
  fontWeight: theme.typography?.weight?.bold || '700',
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
}));

export const RequiredAsterisk = styled.span(({ theme }) => ({
  color: theme.fgColor?.negative || theme.color?.negative || '#FF4400'
}));

export const VisuallyHidden = styled.span({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0
});

export const ErrorText = styled.p(({ theme }) => ({
  fontSize: theme.typography?.size?.s1 ? `${theme.typography.size.s1}px` : '11px',
  color: theme.fgColor?.negative || theme.color?.negative || '#FF4400',
  margin: '2px 0 0 0'
}));

export interface FieldRenderProps {
  describedBy?: string;
  invalid: boolean;
}

export interface CommonFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: (props: FieldRenderProps) => React.ReactNode;
}

export const LabelContent: React.FC<{ label: string; required?: boolean }> = ({
  label,
  required
}) => (
  <>
    {label}
    {required && (
      <>
        <RequiredAsterisk aria-hidden="true">*</RequiredAsterisk>
        <VisuallyHidden>Required</VisuallyHidden>
      </>
    )}
  </>
);

export const Field: React.FC<CommonFieldProps> = ({ id, label, required, error, children }) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <FieldContainer>
      <Label htmlFor={id}>
        <LabelContent label={label} required={required} />
      </Label>
      {children({ describedBy: errorId, invalid: !!error })}
      {error && (
        <ErrorText id={errorId} role="alert">
          {error}
        </ErrorText>
      )}
    </FieldContainer>
  );
};
