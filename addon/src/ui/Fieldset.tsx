import { FC } from 'react';
import { styled } from 'storybook/theming';
import type { CommonFieldProps } from './Field';
import { ErrorText } from './ErrorText';
import { LabelContent } from './Label';
import { fieldTextStyles } from './styles';

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

export const Fieldset: FC<CommonFieldProps> = ({ id, label, required, error, children }) => {
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
