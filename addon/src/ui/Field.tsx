import { FC, ReactNode } from 'react';
import { styled } from 'storybook/theming';
import { ErrorText } from './ErrorText';
import { Label, LabelContent } from './Label';

const FieldContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
});

export interface FieldRenderProps {
  describedBy?: string;
  invalid: boolean;
}

export interface CommonFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: (props: FieldRenderProps) => ReactNode;
}

export const Field: FC<CommonFieldProps> = ({ id, label, required, error, children }) => {
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
