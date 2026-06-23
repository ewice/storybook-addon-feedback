import { FC } from 'react';
import { styled } from 'storybook/theming';
import type { SurveyMessages } from '../types';
import { Button } from '../ui/Button';
import { mutedTextStyles } from '../ui/styles';
import { COMPONENT_MESSAGES, resolveMessage } from '../utils/messages';

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
  messages?: SurveyMessages;
}

export const SurveyThankYou: FC<SurveyThankYouProps> = ({ onClose, messages }) => {
  const titleText = resolveMessage(messages?.thankYouTitle, COMPONENT_MESSAGES.thankYouTitle);
  const bodyText = resolveMessage(messages?.thankYouBody, COMPONENT_MESSAGES.thankYouBody);
  const closeText = resolveMessage(messages?.thankYouClose, COMPONENT_MESSAGES.thankYouClose);

  return (
    <ThankYouContainer role="status" aria-live="polite">
      <ThankYouTitle>{titleText}</ThankYouTitle>
      <ThankYouText>{bodyText}</ThankYouText>
      <CenteredActions>
        <Button onClick={onClose}>{closeText}</Button>
      </CenteredActions>
    </ThankYouContainer>
  );
};
