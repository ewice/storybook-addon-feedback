import React from 'react';
import { styled } from 'storybook/theming';

const ErrorSummaryContainer = styled.div(({ theme }) => ({
  backgroundColor: theme.bgColor.negative,
  border: `1px solid ${theme.borderColor.negative}`,
  borderRadius: theme.appBorderRadius,
  color: theme.fgColor?.default,
  padding: '12px'
}));

const ErrorSummaryTitle = styled.p(({ theme }) => ({
  fontSize: theme.typography.size.s2,
  fontWeight: theme.typography.weight.bold,
  margin: '0 0 6px 0'
}));

const ErrorSummaryList = styled.ul(({ theme }) => ({
  fontSize: theme.typography.size.s1,
  margin: 0,
  paddingLeft: '18px'
}));

interface ErrorSummaryProps {
  items: Array<{ id: string; label: string; message: string }>;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({ items }) => (
  <ErrorSummaryContainer role="alert" aria-live="assertive">
    <ErrorSummaryTitle>Please review the highlighted fields.</ErrorSummaryTitle>
    <ErrorSummaryList>
      {items.map(({ id, label, message }) => (
        <li key={id}>
          {label}: {message}
        </li>
      ))}
    </ErrorSummaryList>
  </ErrorSummaryContainer>
);
