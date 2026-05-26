import { type FC } from 'react';
import { styled } from 'storybook/theming';
import { fieldTextStyles } from './styles';
import { VisuallyHidden } from './VisuallyHidden';

export const RequiredAsterisk = styled.span(({ theme }) => ({
  color: theme.fgColor.negative
}));

export const LabelContent: FC<{ label: string; required?: boolean }> = ({ label, required }) => (
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

export const Label = styled.label(({ theme }) => ({
  ...fieldTextStyles(theme),
  fontWeight: theme.typography.weight.bold,
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
}));
