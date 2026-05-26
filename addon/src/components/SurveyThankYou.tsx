import { FC } from 'react';
import { styled } from 'storybook/theming';
import { Button, mutedTextStyles } from '../ui';

const ThankYouContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px 16px',
  textAlign: 'center',
  color: theme.fgColor.default
}));

const ThankYouTitle = styled.h3(({ theme }) => ({
  fontSize: theme.typography.size.m1,
  fontWeight: theme.typography.weight.bold,
  margin: '0 0 8px 0',
  color: theme.fgColor.default
}));

const ThankYouText = styled.p(({ theme }) => ({
  fontSize: theme.typography.size.s2,
  margin: 0,
  ...mutedTextStyles(theme)
}));

const CenteredActions = styled.div({
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
  marginTop: '24px'
});

interface SurveyThankYouProps {
  onClose: () => void;
}

export const SurveyThankYou: FC<SurveyThankYouProps> = ({ onClose }) => (
  <ThankYouContainer role="status" aria-live="polite">
    <ThankYouTitle>Thank you!</ThankYouTitle>
    <ThankYouText>Your feedback has been successfully submitted.</ThankYouText>
    <CenteredActions>
      <Button onClick={onClose}>Close</Button>
    </CenteredActions>
  </ThankYouContainer>
);
