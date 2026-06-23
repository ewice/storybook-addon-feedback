import { renderHook } from '@testing-library/react';
import * as fc from 'fast-check';
import { useMemo } from 'react';
import { describe, it, expect } from 'vite-plus/test';
import type { SurveyConfig, SurveyField } from '../types';
import { DEFAULT_SURVEY_ID } from '../constants';

/**
 * Extract the config assembly logic from FeedbackAddon as a pure function
 * to test the spread-based precedence: defaults < buildTimeOptions < parameterOptions.
 */
const assembleConfig = (
  buildTimeOptions?: Partial<SurveyConfig>,
  parameterOptions?: Partial<SurveyConfig> | null
): SurveyConfig => ({
  surveyId: DEFAULT_SURVEY_ID,
  title: 'Feedback Survey',
  description: 'Help us improve by sharing your thoughts!',
  questions: [],
  ...buildTimeOptions,
  ...parameterOptions
});

const partialConfigArb = fc.record(
  {
    surveyId: fc.string({ minLength: 1 }),
    title: fc.string({ minLength: 1 }),
    description: fc.string({ minLength: 1 }),
    questions: fc.constant([] as SurveyField[])
  },
  { requiredKeys: [] }
);

describe('assembleConfig - Property 11: Config assembly precedence', () => {
  it('parameterOptions fields override buildTimeOptions and defaults', () => {
    fc.assert(
      fc.property(partialConfigArb, partialConfigArb, (buildTime, parameter) => {
        const result = assembleConfig(buildTime, parameter);

        if (parameter.surveyId !== undefined) {
          expect(result.surveyId).toBe(parameter.surveyId);
        } else if (buildTime.surveyId !== undefined) {
          expect(result.surveyId).toBe(buildTime.surveyId);
        } else {
          expect(result.surveyId).toBe(DEFAULT_SURVEY_ID);
        }

        if (parameter.title !== undefined) {
          expect(result.title).toBe(parameter.title);
        } else if (buildTime.title !== undefined) {
          expect(result.title).toBe(buildTime.title);
        } else {
          expect(result.title).toBe('Feedback Survey');
        }

        if (parameter.description !== undefined) {
          expect(result.description).toBe(parameter.description);
        } else if (buildTime.description !== undefined) {
          expect(result.description).toBe(buildTime.description);
        } else {
          expect(result.description).toBe('Help us improve by sharing your thoughts!');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('when neither buildTimeOptions nor parameterOptions supply a field, the default is used', () => {
    fc.assert(
      fc.property(partialConfigArb, partialConfigArb, (buildTime, parameter) => {
        const result = assembleConfig(buildTime, parameter);

        if (parameter.surveyId === undefined && buildTime.surveyId === undefined) {
          expect(result.surveyId).toBe(DEFAULT_SURVEY_ID);
        }
        if (parameter.title === undefined && buildTime.title === undefined) {
          expect(result.title).toBe('Feedback Survey');
        }
        if (parameter.description === undefined && buildTime.description === undefined) {
          expect(result.description).toBe('Help us improve by sharing your thoughts!');
        }
        if (parameter.questions === undefined && buildTime.questions === undefined) {
          expect(result.questions).toEqual([]);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('buildTimeOptions override defaults when parameterOptions is null', () => {
    fc.assert(
      fc.property(partialConfigArb, (buildTime) => {
        const result = assembleConfig(buildTime, null);

        if (buildTime.surveyId !== undefined) {
          expect(result.surveyId).toBe(buildTime.surveyId);
        } else {
          expect(result.surveyId).toBe(DEFAULT_SURVEY_ID);
        }

        if (buildTime.title !== undefined) {
          expect(result.title).toBe(buildTime.title);
        } else {
          expect(result.title).toBe('Feedback Survey');
        }

        if (buildTime.description !== undefined) {
          expect(result.description).toBe(buildTime.description);
        } else {
          expect(result.description).toBe('Help us improve by sharing your thoughts!');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('with no options, all fields equal their documented defaults', () => {
    const result = assembleConfig(undefined, null);

    expect(result.surveyId).toBe('default-survey-v1');
    expect(result.title).toBe('Feedback Survey');
    expect(result.description).toBe('Help us improve by sharing your thoughts!');
    expect(result.questions).toEqual([]);
  });
});

/**
 * Mirror the container's memoization logic to validate reference stability.
 */
const useAssembleConfig = (
  buildTimeOptions?: Partial<SurveyConfig>,
  parameterOptions?: Partial<SurveyConfig> | null
) =>
  useMemo(
    () => ({
      surveyId: DEFAULT_SURVEY_ID,
      title: 'Feedback Survey',
      description: 'Help us improve by sharing your thoughts!',
      questions: [],
      ...buildTimeOptions,
      ...parameterOptions
    }),
    [buildTimeOptions, parameterOptions]
  );

describe('Config memoization stability', () => {
  it('stable inputs produce the same config reference across rerenders', () => {
    const stableBuildTime: Partial<SurveyConfig> = { title: 'Custom Title' };
    const stableParameter: Partial<SurveyConfig> = { description: 'Custom Desc' };

    const { result, rerender } = renderHook(
      ({ buildTime, parameter }) => useAssembleConfig(buildTime, parameter),
      {
        initialProps: {
          buildTime: stableBuildTime,
          parameter: stableParameter as Partial<SurveyConfig> | null
        }
      }
    );

    const firstRef = result.current;

    rerender({ buildTime: stableBuildTime, parameter: stableParameter });

    const secondRef = result.current;

    expect(Object.is(firstRef, secondRef)).toBe(true);
  });

  it('changed buildTimeOptions reference produces a new config reference', () => {
    const initialBuildTime: Partial<SurveyConfig> = { title: 'Title A' };
    const parameter: Partial<SurveyConfig> | null = null;

    const { result, rerender } = renderHook(
      ({ buildTime, param }) => useAssembleConfig(buildTime, param),
      {
        initialProps: {
          buildTime: initialBuildTime as Partial<SurveyConfig> | undefined,
          param: parameter
        }
      }
    );

    const firstRef = result.current;

    const newBuildTime: Partial<SurveyConfig> = { title: 'Title B' };
    rerender({ buildTime: newBuildTime, param: parameter });

    const secondRef = result.current;

    expect(Object.is(firstRef, secondRef)).toBe(false);
  });

  it('changed parameterOptions reference produces a new config reference', () => {
    const buildTime: Partial<SurveyConfig> | undefined = undefined;
    const initialParameter: Partial<SurveyConfig> = { surveyId: 'survey-1' };

    const { result, rerender } = renderHook(({ build, param }) => useAssembleConfig(build, param), {
      initialProps: { build: buildTime, param: initialParameter as Partial<SurveyConfig> | null }
    });

    const firstRef = result.current;

    const newParameter: Partial<SurveyConfig> = { surveyId: 'survey-2' };
    rerender({ build: buildTime, param: newParameter });

    const secondRef = result.current;

    expect(Object.is(firstRef, secondRef)).toBe(false);
  });

  it('multiple stable rerenders maintain the same config reference', () => {
    const stableBuildTime: Partial<SurveyConfig> = { title: 'Stable' };
    const stableParameter: Partial<SurveyConfig> | null = null;

    const { result, rerender } = renderHook(
      ({ buildTime, param }) => useAssembleConfig(buildTime, param),
      {
        initialProps: {
          buildTime: stableBuildTime as Partial<SurveyConfig> | undefined,
          param: stableParameter
        }
      }
    );

    const firstRef = result.current;

    rerender({ buildTime: stableBuildTime, param: stableParameter });
    rerender({ buildTime: stableBuildTime, param: stableParameter });
    rerender({ buildTime: stableBuildTime, param: stableParameter });

    const lastRef = result.current;

    expect(Object.is(firstRef, lastRef)).toBe(true);
  });
});

import { renderHook as renderHookRTL, act as actRTL } from '@testing-library/react';
import { useSurveyStorage } from '../hooks/useSurveyStorage';
import { createMemoryStorage } from '../utils/storage';

describe('FeedbackAddon - notification dot and handlers logic', () => {
  const surveyId = 'notification-test-survey';

  describe('notification dot visibility', () => {
    it('shows notification dot when survey is neither completed nor skipped permanently', () => {
      const storage = createMemoryStorage();
      const { result } = renderHookRTL(() => useSurveyStorage(surveyId, storage));

      const showNotification =
        !result.current.state.isCompleted && !result.current.state.isSkippedPermanently;

      expect(showNotification).toBe(true);
    });

    it('hides notification dot after survey is completed', () => {
      const storage = createMemoryStorage();
      const { result } = renderHookRTL(() => useSurveyStorage(surveyId, storage));

      actRTL(() => {
        result.current.actions.complete();
      });

      const showNotification =
        !result.current.state.isCompleted && !result.current.state.isSkippedPermanently;

      expect(showNotification).toBe(false);
    });

    it('hides notification dot after survey is skipped permanently', () => {
      const storage = createMemoryStorage();
      const { result } = renderHookRTL(() => useSurveyStorage(surveyId, storage));

      actRTL(() => {
        result.current.actions.skipPermanently();
      });

      const showNotification =
        !result.current.state.isCompleted && !result.current.state.isSkippedPermanently;

      expect(showNotification).toBe(false);
    });
  });

  describe('close handler records dismissal when not completed', () => {
    it('dismiss sets dismissedAt timestamp and marks session as dismissed', () => {
      const storage = createMemoryStorage();
      const { result } = renderHookRTL(() => useSurveyStorage(surveyId, storage));
      const timestamp = 1700000000000;

      actRTL(() => {
        result.current.actions.dismiss(timestamp);
      });

      expect(result.current.state.dismissedAt).toBe(timestamp);
      expect(result.current.state.isSessionDismissed).toBe(true);
    });
  });

  describe('skip permanently handler', () => {
    it('skipPermanently sets isSkippedPermanently to true', () => {
      const storage = createMemoryStorage();
      const { result } = renderHookRTL(() => useSurveyStorage(surveyId, storage));

      actRTL(() => {
        result.current.actions.skipPermanently();
      });

      expect(result.current.state.isSkippedPermanently).toBe(true);
    });
  });
});
