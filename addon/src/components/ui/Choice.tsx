import { styled } from 'storybook/theming';
import { fieldTextStyles, focusRing } from './styles';

export const ChoiceGroup = styled.div<{ direction?: 'row' | 'column' }>(
  ({ direction = 'column' }) => ({
    display: 'flex',
    flexDirection: direction,
    flexWrap: direction === 'row' ? 'wrap' : 'nowrap',
    gap: direction === 'row' ? '12px 16px' : '8px',
    padding: '4px 0'
  })
);

export const ChoiceRow = styled.label(({ theme }) => ({
  ...fieldTextStyles(theme),
  alignItems: 'center',
  borderRadius: theme.appBorderRadius,
  cursor: 'pointer',
  display: 'flex',
  gap: '8px',
  minHeight: '32px',
  padding: '4px 8px',
  marginLeft: '-8px',
  userSelect: 'none',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.background.hoverable
  },
  '&:has(input:focus-visible)': focusRing(theme)
}));

export const ChoiceInput = styled.input(({ theme }) => ({
  cursor: 'pointer',
  accentColor: theme.barSelectedColor
}));
