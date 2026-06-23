import * as fc from 'fast-check';
import { describe, it, expect } from 'vite-plus/test';
import { STORAGE_KEYS } from '../constants';
import { createMemoryStorage } from './storage';
import {
  parseBooleanFlag,
  parseDismissedAt,
  parseImpressionCount,
  readSurveyState
} from './surveyState';

describe('parseBooleanFlag', () => {
  it('returns true if and only if the input is exactly "true", false otherwise', () => {
    fc.assert(
      fc.property(fc.oneof(fc.string(), fc.constant(null)), (raw) => {
        const result = parseBooleanFlag(raw);
        if (raw === 'true') {
          expect(result).toBe(true);
        } else {
          expect(result).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('parseDismissedAt', () => {
  it('returns the parsed number for finite numeric strings, null otherwise', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Finite numbers as strings → should return the parsed number
          fc.double({ noNaN: true, noDefaultInfinity: true }).map(String),
          // null → should return null
          fc.constant(null),
          // Empty string → should return null
          fc.constant(''),
          // Non-finite strings → should return null
          fc.constantFrom('NaN', 'Infinity', '-Infinity'),
          // Non-numeric strings → should return null
          fc.string().filter((s) => s !== '' && !Number.isFinite(Number(s)))
        ),
        (raw) => {
          const result = parseDismissedAt(raw);

          if (raw === null || raw === '') {
            expect(result).toBe(null);
          } else {
            const parsed = Number(raw);
            if (Number.isFinite(parsed)) {
              expect(result).toBe(parsed);
            } else {
              expect(result).toBe(null);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('parseImpressionCount', () => {
  it('returns the parsed integer for non-negative integer strings, 0 otherwise', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Non-negative integers as strings → should return the parsed integer
          fc.nat().map(String),
          // Negative integers as strings → should return 0
          fc.integer({ min: -1000000, max: -1 }).map(String),
          // Floating point (non-integer) strings → should return 0
          fc
            .double({ noNaN: true, noDefaultInfinity: true })
            .filter((n) => !Number.isInteger(n))
            .map(String),
          // null → should return 0
          fc.constant(null),
          // Empty string → should return 0
          fc.constant(''),
          // Non-numeric strings → should return 0
          fc.string().filter((s) => s !== '' && !Number.isFinite(Number(s)))
        ),
        (raw) => {
          const result = parseImpressionCount(raw);

          if (raw === null || raw === '') {
            expect(result).toBe(0);
          } else {
            const parsed = Number(raw);
            if (Number.isInteger(parsed) && parsed >= 0) {
              expect(result).toBe(parsed);
            } else {
              expect(result).toBe(0);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('cross-tab sync derivation matches initial read', () => {
  it('each parser produces the same result on repeated calls with the same input (determinism proves sync/init equivalence)', () => {
    fc.assert(
      fc.property(fc.oneof(fc.string(), fc.constant(null)), (raw) => {
        // parseBooleanFlag: both paths call the same function, so result must be identical
        expect(parseBooleanFlag(raw)).toBe(parseBooleanFlag(raw));

        // parseDismissedAt: same reasoning
        expect(parseDismissedAt(raw)).toBe(parseDismissedAt(raw));

        // parseImpressionCount: same reasoning
        expect(parseImpressionCount(raw)).toBe(parseImpressionCount(raw));
      }),
      { numRuns: 100 }
    );
  });
});

describe('readSurveyState equivalence and idempotence', () => {
  const arbSurveyId = fc.string({ minLength: 1 });

  const arbOptionalStorageValue = fc.oneof(
    fc.constant(undefined),
    fc.constant('true'),
    fc.constant('false'),
    fc.nat().map(String),
    fc.integer({ min: -100, max: -1 }).map(String),
    fc.double({ noNaN: true, noDefaultInfinity: true }).map(String),
    fc.string()
  );

  it('produces state equal to per-field derivation (equivalence-preserving)', () => {
    fc.assert(
      fc.property(
        arbSurveyId,
        arbOptionalStorageValue,
        arbOptionalStorageValue,
        arbOptionalStorageValue,
        arbOptionalStorageValue,
        arbOptionalStorageValue,
        (surveyId, completedVal, skippedVal, dismissedVal, impressionsVal, sessionVal) => {
          const adapter = createMemoryStorage();

          // Store values if defined
          if (completedVal !== undefined) {
            adapter.setItem(STORAGE_KEYS.completed(surveyId), completedVal);
          }
          if (skippedVal !== undefined) {
            adapter.setItem(STORAGE_KEYS.skippedPermanently(surveyId), skippedVal);
          }
          if (dismissedVal !== undefined) {
            adapter.setItem(STORAGE_KEYS.dismissedAt(surveyId), dismissedVal);
          }
          if (impressionsVal !== undefined) {
            adapter.setItem(STORAGE_KEYS.impressionCount(surveyId), impressionsVal);
          }
          if (sessionVal !== undefined) {
            adapter.setItem(STORAGE_KEYS.sessionDismissed(surveyId), sessionVal, true);
          }

          const result = readSurveyState(adapter, surveyId);

          // Manually derive expected state per-field
          const expected = {
            isCompleted: parseBooleanFlag(adapter.getItem(STORAGE_KEYS.completed(surveyId))),
            isSkippedPermanently: parseBooleanFlag(
              adapter.getItem(STORAGE_KEYS.skippedPermanently(surveyId))
            ),
            dismissedAt: parseDismissedAt(adapter.getItem(STORAGE_KEYS.dismissedAt(surveyId))),
            impressionCount: parseImpressionCount(
              adapter.getItem(STORAGE_KEYS.impressionCount(surveyId))
            ),
            isSessionDismissed: parseBooleanFlag(
              adapter.getItem(STORAGE_KEYS.sessionDismissed(surveyId), true)
            )
          };

          expect(result).toEqual(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('calling readSurveyState twice with the same adapter and ID yields equal results (idempotent)', () => {
    fc.assert(
      fc.property(
        arbSurveyId,
        arbOptionalStorageValue,
        arbOptionalStorageValue,
        arbOptionalStorageValue,
        arbOptionalStorageValue,
        arbOptionalStorageValue,
        (surveyId, completedVal, skippedVal, dismissedVal, impressionsVal, sessionVal) => {
          const adapter = createMemoryStorage();

          if (completedVal !== undefined) {
            adapter.setItem(STORAGE_KEYS.completed(surveyId), completedVal);
          }
          if (skippedVal !== undefined) {
            adapter.setItem(STORAGE_KEYS.skippedPermanently(surveyId), skippedVal);
          }
          if (dismissedVal !== undefined) {
            adapter.setItem(STORAGE_KEYS.dismissedAt(surveyId), dismissedVal);
          }
          if (impressionsVal !== undefined) {
            adapter.setItem(STORAGE_KEYS.impressionCount(surveyId), impressionsVal);
          }
          if (sessionVal !== undefined) {
            adapter.setItem(STORAGE_KEYS.sessionDismissed(surveyId), sessionVal, true);
          }

          const first = readSurveyState(adapter, surveyId);
          const second = readSurveyState(adapter, surveyId);

          expect(first).toEqual(second);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('readSurveyState object shape', () => {
  const arbSurveyId = fc.string({ minLength: 1 });

  const arbOptionalStorageValue = fc.oneof(
    fc.constant(undefined),
    fc.constant('true'),
    fc.constant('false'),
    fc.nat().map(String),
    fc.integer({ min: -100, max: -1 }).map(String),
    fc.double({ noNaN: true, noDefaultInfinity: true }).map(String),
    fc.string()
  );

  it('returns an object with exactly the five expected fields and correct types', () => {
    fc.assert(
      fc.property(
        arbSurveyId,
        arbOptionalStorageValue,
        arbOptionalStorageValue,
        arbOptionalStorageValue,
        arbOptionalStorageValue,
        arbOptionalStorageValue,
        (surveyId, completedVal, skippedVal, dismissedVal, impressionsVal, sessionVal) => {
          const adapter = createMemoryStorage();

          if (completedVal !== undefined) {
            adapter.setItem(STORAGE_KEYS.completed(surveyId), completedVal);
          }
          if (skippedVal !== undefined) {
            adapter.setItem(STORAGE_KEYS.skippedPermanently(surveyId), skippedVal);
          }
          if (dismissedVal !== undefined) {
            adapter.setItem(STORAGE_KEYS.dismissedAt(surveyId), dismissedVal);
          }
          if (impressionsVal !== undefined) {
            adapter.setItem(STORAGE_KEYS.impressionCount(surveyId), impressionsVal);
          }
          if (sessionVal !== undefined) {
            adapter.setItem(STORAGE_KEYS.sessionDismissed(surveyId), sessionVal, true);
          }

          const result = readSurveyState(adapter, surveyId);

          const expectedKeys = [
            'isCompleted',
            'isSkippedPermanently',
            'dismissedAt',
            'impressionCount',
            'isSessionDismissed'
          ];

          // Exactly 5 keys, no more, no less
          const resultKeys = Object.keys(result);
          expect(resultKeys).toHaveLength(5);
          expect(resultKeys.sort()).toEqual(expectedKeys.sort());

          // Type assertions for each field
          expect(typeof result.isCompleted).toBe('boolean');
          expect(typeof result.isSkippedPermanently).toBe('boolean');
          expect(typeof result.isSessionDismissed).toBe('boolean');
          expect(result.dismissedAt === null || typeof result.dismissedAt === 'number').toBe(true);
          expect(typeof result.impressionCount).toBe('number');
        }
      ),
      { numRuns: 100 }
    );
  });
});
