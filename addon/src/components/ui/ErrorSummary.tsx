import React from 'react';
import { styled } from 'storybook/theming';

const ErrorSummaryContainer = styled.div(({ theme }) => ({
  border: `1px solid ${theme.borderColor?.negative || theme.fgColor?.negative || theme.color?.negative || '#FF4400'}`,
  borderRadius: theme.appBorderRadius ? `${theme.appBorderRadius}px` : '6px',
  padding: '12px',
  backgroundColor:
    theme.bgColor?.negative ||
    (theme.base === 'dark'
      ? `color-mix(in srgb, ${theme.color?.negative || '#FF4400'} 14%, transparent)`
      : `color-mix(in srgb, ${theme.color?.negative || '#FF4400'} 8%, transparent)`),
  color: theme.fgColor?.default || theme.textColor || '#333333'
}));

const ErrorSummaryTitle = styled.p(({ theme }) => ({
  margin: '0 0 6px 0',
  fontSize: theme.typography?.size?.s2 ? `${theme.typography.size.s2}px` : '13px',
  fontWeight: theme.typography?.weight?.bold || '700'
}));

const ErrorSummaryList = styled.ul(({ theme }) => ({
  margin: 0,
  paddingLeft: '18px',
  fontSize: theme.typography?.size?.s1 ? `${theme.typography.size.s1}px` : '12px'
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
