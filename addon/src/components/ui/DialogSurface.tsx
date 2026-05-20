import React from 'react';
import { styled } from 'storybook/theming';
import { focusRing, modalCardShadow, mutedTextStyles, uiFontFamily } from './styles';

const DialogRoot = styled.dialog({
  padding: 0,
  border: 'none',
  background: 'transparent',
  width: 'min(520px, calc(100vw - 32px))',
  maxWidth: '520px',
  maxHeight: '85vh',
  overflow: 'visible',
  zIndex: 999999,
  fontFamily: uiFontFamily,
  whiteSpace: 'normal',
  '&::backdrop': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(3px)',
  },
});

const Card = styled.div(({ theme }) => ({
  backgroundColor: theme.background.content,
  borderRadius: '8px',
  border: `1px solid ${theme.appBorderColor}`,
  boxShadow: modalCardShadow(theme),
  width: '100%',
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  animation: 'sbSurveyFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
  '@keyframes sbSurveyFadeIn': {
    from: {
      opacity: 0,
      transform: 'translateY(12px) scale(0.97)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0) scale(1)',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
}));

const Header = styled.div(({ theme }) => ({
  padding: '20px 24px 16px',
  borderBottom: `1px solid ${theme.appBorderColor}`,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  minWidth: 0,
  overflow: 'hidden',
}));

const HeaderTopRow = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
  minWidth: 0,
});

const Title = styled.h2(({ theme }) => ({
  fontSize: '18px',
  fontWeight: '800',
  margin: 0,
  color: theme.textColor,
  minWidth: 0,
  overflowWrap: 'anywhere',
}));

const Description = styled.p(({ theme }) => ({
  fontSize: '13px',
  margin: 0,
  lineHeight: '18px',
  minWidth: 0,
  whiteSpace: 'normal',
  overflowWrap: 'anywhere',
  ...mutedTextStyles(theme),
}));

const CloseButton = styled.button(({ theme }) => ({
  flexShrink: 0,
  minWidth: '32px',
  minHeight: '32px',
  padding: '4px',
  border: 'none',
  borderRadius: '4px',
  background: 'none',
  color: theme.textMutedColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.2s, color 0.2s',
  '&:hover': {
    backgroundColor: theme.appBorderColor,
    color: theme.textColor,
  },
  '&:focus-visible': focusRing(theme),
}));

const Body = styled.div({
  padding: '20px 24px 24px',
  overflowY: 'auto',
  flex: 1,
});

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface DialogSurfaceProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const DialogSurface: React.FC<DialogSurfaceProps> = ({
  isOpen,
  title,
  description,
  onClose,
  children,
}) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog || !isOpen) {
      return;
    }

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) {
        onClose();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('click', handleBackdropClick);

    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('click', handleBackdropClick);

      if (dialog.open) {
        dialog.close();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <DialogRoot
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <Card>
        <Header>
          <HeaderTopRow>
            <Title id={titleId}>{title}</Title>
            <CloseButton onClick={onClose} aria-label="Close survey" autoFocus>
              <CloseIcon />
            </CloseButton>
          </HeaderTopRow>
          {description && <Description id={descriptionId}>{description}</Description>}
        </Header>
        <Body>{children}</Body>
      </Card>
    </DialogRoot>
  );
};
