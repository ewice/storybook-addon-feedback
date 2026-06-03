import { useEffect, useRef, useState, useMemo } from 'react';
import { SurveyConfig } from '../types';
import { DEFAULT_DELAY_MS, DEFAULT_STORY_COUNT, MS_PER_DAY } from '../constants';

export interface SurveyLifecycleProps {
  config: SurveyConfig;
  isCompleted: boolean;
  isSkippedPermanently: boolean;
  dismissedAt: number | null;
  impressionCount: number;
  incrementImpressions: () => number;
  onStoryChange: (cb: () => void) => () => void;
  isSessionDismissed: boolean;
}

export const useSurveyLifecycle = ({
  config,
  isCompleted,
  isSkippedPermanently,
  dismissedAt,
  impressionCount,
  incrementImpressions,
  onStoryChange,
  isSessionDismissed
}: SurveyLifecycleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [navCount, setNavCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerOptions = config.trigger || {};

  // 1. Calculate Suppression States
  const shouldBlockAutoPopup = useMemo(() => {
    const isExpired = triggerOptions.expiresAt
      ? new Date() > new Date(triggerOptions.expiresAt)
      : false;
    const isGloballyDisabled = config.enabled === false;
    const isMaxImpressionsReached =
      !!triggerOptions.maxImpressions && impressionCount >= triggerOptions.maxImpressions;

    let isSnoozed = false;
    if (dismissedAt && triggerOptions.coolDownDays) {
      const coolDownMs = triggerOptions.coolDownDays * MS_PER_DAY;
      const timeSinceDismissal = Date.now() - dismissedAt;
      if (timeSinceDismissal < coolDownMs) {
        isSnoozed = true;
      }
    }

    return (
      isCompleted ||
      isSkippedPermanently ||
      isSessionDismissed ||
      isExpired ||
      isGloballyDisabled ||
      isMaxImpressionsReached ||
      isSnoozed
    );
  }, [
    isCompleted,
    isSkippedPermanently,
    isSessionDismissed,
    config.enabled,
    triggerOptions.expiresAt,
    triggerOptions.maxImpressions,
    triggerOptions.coolDownDays,
    dismissedAt,
    impressionCount
  ]);

  // 2. Handle Automatic Time-Delay Trigger
  useEffect(() => {
    if (shouldBlockAutoPopup || isOpen || !config.questions || config.questions.length === 0) {
      return;
    }

    const delay = triggerOptions.delayMs !== undefined ? triggerOptions.delayMs : DEFAULT_DELAY_MS;

    if (delay > 0) {
      timerRef.current = setTimeout(() => {
        incrementImpressions();
        setIsOpen(true);
      }, delay);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    shouldBlockAutoPopup,
    config.questions,
    triggerOptions.delayMs,
    isOpen,
    incrementImpressions
  ]);

  // 3. Handle Story Navigation Count Trigger
  useEffect(() => {
    const handleStoryChanged = () => {
      setNavCount((prev) => {
        const nextCount = prev + 1;
        const requiredNavs =
          triggerOptions.storyCount !== undefined ? triggerOptions.storyCount : DEFAULT_STORY_COUNT;

        if (!shouldBlockAutoPopup && !isOpen && requiredNavs > 0 && nextCount >= requiredNavs) {
          incrementImpressions();
          setIsOpen(true);
        }
        return nextCount;
      });
    };

    const unsubscribe = onStoryChange(handleStoryChanged);
    return () => {
      unsubscribe();
    };
  }, [onStoryChange, shouldBlockAutoPopup, triggerOptions.storyCount, isOpen, incrementImpressions]);

  // 4. Handle Global Keyboard Shortcut Override (Alt + Shift + S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    isOpen,
    setIsOpen,
    shouldBlockAutoPopup,
    navCount
  };
};
