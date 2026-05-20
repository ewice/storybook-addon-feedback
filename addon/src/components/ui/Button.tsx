import React from 'react';
import { styled } from 'storybook/theming';
import { focusRing } from './styles';

type ButtonVariant = 'primary' | 'secondary' | 'dangerSubtle';

const StyledButton = styled.button<{ $variant: ButtonVariant; disabled?: boolean }>(({ theme, $variant, disabled }) => {
  const baseStyles = {
    padding: '8px 16px',
    minHeight: '36px',
    minWidth: '36px',
    fontSize: '13px',
    fontWeight: '700',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
    '&:focus-visible': focusRing(theme),
  };

  if ($variant === 'secondary') {
    return {
      ...baseStyles,
      border: `1px solid ${theme.appBorderColor}`,
      backgroundColor: theme.background.content,
      color: theme.textColor,
      '&:hover': disabled
        ? undefined
        : {
            backgroundColor: theme.background.app,
          },
    };
  }

  if ($variant === 'dangerSubtle') {
    return {
      ...baseStyles,
      border: `1px solid ${theme.color.negative}`,
      backgroundColor: 'transparent',
      color: theme.color.negative,
      '&:hover': disabled
        ? undefined
        : {
            backgroundColor: theme.base === 'dark'
              ? `color-mix(in srgb, ${theme.color.negative} 14%, transparent)`
              : `color-mix(in srgb, ${theme.color.negative} 8%, transparent)`,
          },
    };
  }

  return {
    ...baseStyles,
    border: 'none',
    backgroundColor: disabled ? theme.appBorderColor : theme.color.secondary,
    color: theme.textInverseColor,
    '&:hover': disabled
      ? undefined
      : {
          backgroundColor: theme.color.secondaryHot || theme.color.secondary,
        },
  };
});

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  type = 'button',
  ...props
}) => (
  <StyledButton type={type} $variant={variant} {...props} />
);
