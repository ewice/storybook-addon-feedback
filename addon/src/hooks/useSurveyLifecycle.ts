import { useEffect, useRef, useState, useMemo } from 'react';
import type { SurveyConfig } from '../types';
import type { SurveyStorage } from './useSurveyStorage';
import { DEFAULT_DELAY_MS, DEFAULT_STORY_COUNT, MS_PER_DAY } from '../constants';

export interface SurveyLifecycleProps {
  config: SurveyConfig;
  persistence: SurveyStorage;
  onStoryChange: (cb: () => void) => () => void;
}

export const useSurveyLifecycle = ({
  config,
  persistence,
  onStoryChange
}: SurveyLifecycleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [navCount, setNavCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const { recordImpression } = persistence.actions;

  const triggerOptions = config.trigger || {};

  const shouldBlockAutoPopup = useMemo(() => {
    const isCompleted = persistence.state.isCompleted;
    const isSkippedPermanently = persistence.state.isSkippedPermanently;
    const dismissedAt = persistence.state.dismissedAt;
    const impressionCount = persistence.state.impressionCount;
    const isSessionDismissed = persistence.state.isSessionDismissed;

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
    persistence.state.isCompleted,
    persistence.state.isSkippedPermanently,
    persistence.state.dismissedAt,
    persistence.state.impressionCount,
    persistence.state.isSessionDismissed,
    config.enabled,
    triggerOptions.expiresAt,
    triggerOptions.maxImpressions,
    triggerOptions.coolDownDays
  ]);

  useEffect(() => {
    if (shouldBlockAutoPopup || isOpen || !config.questions || config.questions.length === 0) {
      return;
    }

    const delay = triggerOptions.delayMs !== undefined ? triggerOptions.delayMs : DEFAULT_DELAY_MS;

    if (delay > 0) {
      timerRef.current = setTimeout(() => {
        recordImpression();
        setIsOpen(true);
      }, delay);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [shouldBlockAutoPopup, config.questions, triggerOptions.delayMs, isOpen, recordImpression]);

  useEffect(() => {
    const handleStoryChanged = () => {
      setNavCount((prev) => {
        const nextCount = prev + 1;
        const requiredNavs =
          triggerOptions.storyCount !== undefined ? triggerOptions.storyCount : DEFAULT_STORY_COUNT;

        if (!shouldBlockAutoPopup && !isOpen && requiredNavs > 0 && nextCount >= requiredNavs) {
          recordImpression();
          setIsOpen(true);
        }
        return nextCount;
      });
    };

    const unsubscribe = onStoryChange(handleStoryChanged);
    return () => {
      unsubscribe();
    };
  }, [onStoryChange, shouldBlockAutoPopup, triggerOptions.storyCount, isOpen, recordImpression]);

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
