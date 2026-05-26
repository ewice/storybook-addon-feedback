import type { Theme } from 'storybook/theming';

export const focusRing = (theme: Theme) => ({
  outline: '2px solid transparent',
  boxShadow: `0 0 0 2px ${theme.bgColor.default}, 0 0 0 4px ${theme.barSelectedColor}`
});

export const modalCardShadow = (theme: Theme) =>
  theme.base === 'dark' ? '0 12px 36px rgba(0, 0, 0, 0.35)' : '0 12px 36px rgba(38, 85, 115, 0.15)';

export const mutedTextStyles = (theme: Theme) => ({
  color: theme.fgColor.muted
});

export const fieldTextStyles = (theme: Theme) => ({
  color: theme.fgColor.default,
  fontSize: theme.typography.size.s2
});

export const inputBaseStyles = (theme: Theme) => ({
  backgroundColor: theme.input.background,
  border: `1px solid ${theme.input.border}`,
  borderRadius: theme.input.borderRadius,
  color: theme.input.color,
  fontSize: theme.typography.size.s2,
  padding: '8px 12px',
  transition: 'border-color 0.2s',
  '&:focus-visible': {
    borderColor: theme.barSelectedColor,
    ...focusRing(theme)
  }
});
