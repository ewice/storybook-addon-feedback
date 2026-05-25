import { useEffect, useRef, useState } from 'react';
import { API } from 'storybook/manager-api';
import { SurveyConfig } from '../types';

const DEFAULT_DELAY_MS = 5000;
const DEFAULT_STORY_COUNT = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface SurveyLifecycleProps {
  config: SurveyConfig;
  isCompleted: boolean;
  isSkippedPermanently: boolean;
  dismissedAt: number | null;
  impressionCount: number;
  incrementImpressions: () => number;
  api: API;
  isSessionDismissed: boolean;
}

export const useSurveyLifecycle = ({
  config,
  isCompleted,
  isSkippedPermanently,
  dismissedAt,
  impressionCount,
  incrementImpressions,
  api,
  isSessionDismissed
}: SurveyLifecycleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [navCount, setNavCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerOptions = config.trigger || {};

  // 1. Calculate Suppression States
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

  const shouldBlockAutoPopup =
    isCompleted ||
    isSkippedPermanently ||
    isSessionDismissed ||
    isExpired ||
    isGloballyDisabled ||
    isMaxImpressionsReached ||
    isSnoozed;

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

    api.on('storyChanged', handleStoryChanged);
    return () => {
      api.off('storyChanged', handleStoryChanged);
    };
  }, [api, shouldBlockAutoPopup, triggerOptions.storyCount, isOpen, incrementImpressions]);

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
