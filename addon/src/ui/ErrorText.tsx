import { styled } from 'storybook/theming';

export const ErrorText = styled.p(({ theme }) => ({
  fontSize: theme.typography.size.s1,
  color: theme.fgColor.negative,
  margin: '2px 0 0 0'
}));
