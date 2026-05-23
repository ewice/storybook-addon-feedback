import React from 'react';
import { styled } from 'storybook/theming';
import { modalCardShadow } from './styles';
import { DialogHeader } from './DialogHeader';
import { DialogBody } from './DialogBody';

const DialogRoot = styled.dialog(({ theme }) => ({
  padding: 0,
  border: `1px solid ${theme.borderColor.default}`,
  borderRadius: theme.appBorderRadius,
  backgroundColor: theme.bgColor.default,
  boxShadow: modalCardShadow(theme),
  width: 'min(520px, calc(100vw - 32px))',
  maxWidth: '520px',
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  zIndex: 999999,
  fontFamily: theme.typography.fonts.base,
  whiteSpace: 'normal',
  animation: 'sbSurveyFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
  '@keyframes sbSurveyFadeIn': {
    from: {
      opacity: 0,
      transform: 'translateY(12px) scale(0.97)'
    },
    to: {
      opacity: 1,
      transform: 'translateY(0) scale(1)'
    }
  },
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none'
  },
  '&::backdrop': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(3px)'
  }
}));

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
  children
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
      <DialogHeader
        title={title}
        description={description}
        onClose={onClose}
        titleId={titleId}
        descriptionId={descriptionId}
      />
      <DialogBody>{children}</DialogBody>
    </DialogRoot>
  );
};
