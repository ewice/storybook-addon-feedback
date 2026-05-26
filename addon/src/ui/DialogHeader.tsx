import { FC } from 'react';
import { styled } from 'storybook/theming';
import { focusRing, mutedTextStyles } from './styles';

const HeaderRoot = styled.div(({ theme }) => ({
  padding: '20px 24px 16px',
  borderBottom: `1px solid ${theme.borderColor?.default}`,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  minWidth: 0,
  overflow: 'hidden'
}));

const HeaderTopRow = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
  minWidth: 0
});

const Title = styled.h2(({ theme }) => ({
  fontSize: theme.typography.size.m1,
  fontWeight: theme.typography.weight.bold,
  margin: 0,
  color: theme.fgColor.default,
  minWidth: 0,
  overflowWrap: 'anywhere'
}));

const Description = styled.p(({ theme }) => ({
  fontSize: theme.typography.size.s2,
  margin: 0,
  lineHeight: '18px',
  minWidth: 0,
  whiteSpace: 'normal',
  overflowWrap: 'anywhere',
  ...mutedTextStyles(theme)
}));

const CloseButton = styled.button(({ theme }) => ({
  flexShrink: 0,
  minWidth: '32px',
  minHeight: '32px',
  padding: '4px',
  border: 'none',
  borderRadius: theme.appBorderRadius,
  background: 'none',
  color: theme.fgColor.muted,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.2s, color 0.2s',
  '&:hover': {
    backgroundColor: theme.background.hoverable,
    color: theme.fgColor.default
  },
  '&:focus-visible': focusRing(theme)
}));

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface DialogHeaderProps {
  title: string;
  description?: string;
  onClose: () => void;
  titleId?: string;
  descriptionId?: string;
}

export const DialogHeader: FC<DialogHeaderProps> = ({
  title,
  description,
  onClose,
  titleId,
  descriptionId
}) => (
  <HeaderRoot>
    <HeaderTopRow>
      <Title id={titleId}>{title}</Title>
      <CloseButton onClick={onClose} aria-label="Close survey" autoFocus>
        <CloseIcon />
      </CloseButton>
    </HeaderTopRow>
    {description && <Description id={descriptionId}>{description}</Description>}
  </HeaderRoot>
);
