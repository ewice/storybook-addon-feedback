import { styled } from 'storybook/theming';
import { fieldTextStyles, focusRing } from './styles';

export const ChoiceGroup = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '4px 0',
});

export const ChoiceRow = styled.label(({ theme }) => ({
  ...fieldTextStyles(theme),
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minHeight: '32px',
  cursor: 'pointer',
  userSelect: 'none',
  borderRadius: '4px',
  '&:focus-within': focusRing(theme),
}));

export const ChoiceInput = styled.input(({ theme }) => ({
  cursor: 'pointer',
  accentColor: theme.barSelectedColor,
}));
