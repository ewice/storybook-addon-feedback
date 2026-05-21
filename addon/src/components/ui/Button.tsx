import { ComponentProps } from 'react';
import { styled } from 'storybook/theming';
import { focusRing } from './styles';

type ButtonVariant = 'primary' | 'secondary' | 'dangerSubtle';

const StyledButton = styled.button<{ $variant: ButtonVariant; disabled?: boolean }>(
  ({ theme, $variant, disabled }) => {
    const baseStyles = {
      padding: '8px 16px',
      minHeight: '36px',
      minWidth: '36px',
      fontSize: theme.typography.size.s2,
      fontWeight: theme.typography.weight.bold,
      borderRadius: theme.appBorderRadius,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
      '&:focus-visible': focusRing(theme),
    };

    if ($variant === 'secondary') {
      return {
        ...baseStyles,
        border: `1px solid ${theme.borderColor.default}`,
        backgroundColor: theme.bgColor.default,
        color: theme.fgColor.default,
        '&:hover': disabled
          ? undefined
          : {
              backgroundColor: theme.background.hoverable,
            },
      };
    }

    if ($variant === 'dangerSubtle') {
      return {
        ...baseStyles,
        border: `1px solid ${theme.borderColor.negative}`,
        backgroundColor: 'transparent',
        color: theme.fgColor.negative,
        '&:hover': disabled
          ? undefined
          : {
              backgroundColor: theme.bgColor.negative,
            },
      };
    }

    return {
      ...baseStyles,
      border: 'none',
      backgroundColor: disabled ? theme.borderColor.default : theme.color.secondary,
      color: theme.fgColor.inverse,
      '&:hover': disabled
        ? undefined
        : {
            filter: theme.base === 'dark' ? 'brightness(1.12)' : 'brightness(0.92)',
          },
    };
  }
);

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  type = 'button',
  ...props
}) => <StyledButton type={type} $variant={variant} {...props} />;
