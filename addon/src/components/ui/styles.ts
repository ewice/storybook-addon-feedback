import type { Theme } from 'storybook/theming';

export const uiFontFamily = '"Nunito Sans", -apple-system, sans-serif';

export const focusRing = (theme: Theme) => ({
  outline: '2px solid transparent',
  boxShadow: `0 0 0 2px ${theme.background.content}, 0 0 0 4px ${theme.barSelectedColor}`,
});

export const modalCardShadow = (theme: Theme) => (
  theme.base === 'dark'
    ? '0 12px 36px rgba(0, 0, 0, 0.35)'
    : '0 12px 36px rgba(38, 85, 115, 0.15)'
);

export const mutedTextStyles = (theme: Theme) => (
  theme.base === 'dark'
    ? { color: theme.textColor, opacity: 0.88 }
    : { color: theme.textMutedColor }
);

export const fieldTextStyles = (theme: Theme) => ({
  fontSize: '13px',
  color: theme.textColor,
});
