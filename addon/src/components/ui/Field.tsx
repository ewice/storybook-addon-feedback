import React from 'react';
import { styled } from 'storybook/theming';
import { fieldTextStyles } from './styles';

const FieldContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
});

const GroupFieldContainer = styled.fieldset({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  margin: 0,
  padding: 0,
  border: 'none',
  minWidth: 0,
});

const Label = styled.label(({ theme }) => ({
  ...fieldTextStyles(theme),
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
}));

const Legend = styled.legend(({ theme }) => ({
  ...fieldTextStyles(theme),
  fontWeight: '700',
  marginBottom: '6px',
  padding: 0,
}));

const RequiredAsterisk = styled.span(({ theme }) => ({
  color: theme.color.negative,
}));

const VisuallyHidden = styled.span({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

const ErrorText = styled.p(({ theme }) => ({
  fontSize: '11px',
  color: theme.color.negative,
  margin: '2px 0 0 0',
}));

const ErrorSummaryContainer = styled.div(({ theme }) => ({
  border: `1px solid ${theme.color.negative}`,
  borderRadius: '6px',
  padding: '12px',
  backgroundColor: theme.base === 'dark'
    ? `color-mix(in srgb, ${theme.color.negative} 14%, transparent)`
    : `color-mix(in srgb, ${theme.color.negative} 8%, transparent)`,
  color: theme.textColor,
}));

const ErrorSummaryTitle = styled.p({
  margin: '0 0 6px 0',
  fontSize: '13px',
  fontWeight: '700',
});

const ErrorSummaryList = styled.ul({
  margin: 0,
  paddingLeft: '18px',
  fontSize: '12px',
});

interface FieldRenderProps {
  describedBy?: string;
  invalid: boolean;
}

interface CommonFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: (props: FieldRenderProps) => React.ReactNode;
}

const LabelContent: React.FC<{ label: string; required?: boolean }> = ({ label, required }) => (
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
      {error && <ErrorText id={errorId} role="alert">{error}</ErrorText>}
    </FieldContainer>
  );
};

export const Fieldset: React.FC<CommonFieldProps> = ({ id, label, required, error, children }) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <GroupFieldContainer>
      <Legend>
        <LabelContent label={label} required={required} />
      </Legend>
      {children({ describedBy: errorId, invalid: !!error })}
      {error && <ErrorText id={errorId} role="alert">{error}</ErrorText>}
    </GroupFieldContainer>
  );
};

interface ErrorSummaryProps {
  items: Array<{ id: string; label: string; message: string }>;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({ items }) => (
  <ErrorSummaryContainer role="alert" aria-live="assertive">
    <ErrorSummaryTitle>Please review the highlighted fields.</ErrorSummaryTitle>
    <ErrorSummaryList>
      {items.map(({ id, label, message }) => (
        <li key={id}>{label}: {message}</li>
      ))}
    </ErrorSummaryList>
  </ErrorSummaryContainer>
);
