import React from 'react';
import { styled } from 'storybook/theming';
import { fieldTextStyles } from './styles';
import { CommonFieldProps } from './Field';
import { LabelContent } from './Label';
import { ErrorText } from './ErrorText';

const GroupFieldContainer = styled.fieldset({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  margin: 0,
  padding: 0,
  border: 'none',
  minWidth: 0
});

const Legend = styled.legend(({ theme }) => ({
  ...fieldTextStyles(theme),
  fontWeight: theme.typography?.weight?.bold || '700',
  marginBottom: '6px',
  padding: 0
}));

export const Fieldset: React.FC<CommonFieldProps> = ({ id, label, required, error, children }) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <GroupFieldContainer>
      <Legend>
        <LabelContent label={label} required={required} />
      </Legend>
      {children({ describedBy: errorId, invalid: !!error })}
      {error && (
        <ErrorText id={errorId} role="alert">
          {error}
        </ErrorText>
      )}
    </GroupFieldContainer>
  );
};
