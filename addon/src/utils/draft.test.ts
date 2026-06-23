import * as fc from 'fast-check';
import { describe, it, expect } from 'vite-plus/test';
import type { SurveyField, SurveyFieldType, SurveyResponseValue } from '../types';
import { sanitizeDraft } from './draft';

const surveyFieldTypes: SurveyFieldType[] = ['rating', 'radio', 'checkbox', 'text', 'textarea'];

/** Generate a valid value for a given question type */
const validValueForType = (type: SurveyFieldType): fc.Arbitrary<SurveyResponseValue> => {
  switch (type) {
    case 'rating':
      return fc.double({ min: -1e6, max: 1e6, noNaN: true });
    case 'radio':
    case 'text':
    case 'textarea':
      return fc.string();
    case 'checkbox':
      return fc.array(fc.string(), { minLength: 0, maxLength: 5 });
  }
};

/** Generate a value that does NOT match the expected type for a question */
const invalidValueForType = (type: SurveyFieldType): fc.Arbitrary<unknown> => {
  switch (type) {
    case 'rating':
      // rating expects number; give it string, array, or boolean
      return fc.oneof(fc.string(), fc.array(fc.string()), fc.boolean());
    case 'radio':
    case 'text':
    case 'textarea':
      // these expect string; give it number, array, or boolean
      return fc.oneof(fc.integer(), fc.array(fc.string()), fc.boolean());
    case 'checkbox':
      // checkbox expects string[]; give it string, number, boolean, or array with non-strings
      return fc.oneof(
        fc.string(),
        fc.integer(),
        fc.boolean(),
        fc.array(fc.oneof(fc.integer(), fc.boolean()), { minLength: 1, maxLength: 3 })
      );
  }
};

/** Arbitrary for a list of SurveyField with unique IDs */
const surveyFieldsArb: fc.Arbitrary<SurveyField[]> = fc
  .uniqueArray(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 6 })
  .chain((ids) =>
    fc.tuple(
      ...ids.map((id) =>
        fc.record({
          id: fc.constant(id),
          type: fc.constantFrom(...surveyFieldTypes),
          label: fc.string({ minLength: 1, maxLength: 20 })
        })
      )
    )
  ) as fc.Arbitrary<SurveyField[]>;

/**
 * Generate a draft object containing a mix of:
 * - valid entries (matching question IDs with correct types)
 * - invalid entries (matching question IDs with wrong types)
 * - unknown entries (IDs not in questions)
 */
const draftWithMixedEntries = (
  questions: SurveyField[]
): fc.Arbitrary<{
  draft: Record<string, unknown>;
  expectedValid: Record<string, SurveyResponseValue>;
}> => {
  // Generate valid entries for a subset of questions
  const validEntriesArb = fc
    .subarray(questions, { minLength: 0 })
    .chain((subset) =>
      subset.length === 0
        ? fc.constant([] as Array<[string, SurveyResponseValue]>)
        : fc.tuple(
            ...subset.map((q) =>
              validValueForType(q.type).map((v) => [q.id, v] as [string, SurveyResponseValue])
            )
          )
    );

  // Generate invalid entries for a subset of questions
  const invalidEntriesArb = fc
    .subarray(questions, { minLength: 0 })
    .chain((subset) =>
      subset.length === 0
        ? fc.constant([] as Array<[string, unknown]>)
        : fc.tuple(
            ...subset.map((q) =>
              invalidValueForType(q.type).map((v) => [q.id, v] as [string, unknown])
            )
          )
    );

  // Generate unknown entries with IDs not in questions
  const questionIds = new Set(questions.map((q) => q.id));
  const unknownEntriesArb = fc.array(
    fc.tuple(
      fc.string({ minLength: 1, maxLength: 10 }).filter((id) => !questionIds.has(id)),
      fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.array(fc.string()))
    ),
    { minLength: 0, maxLength: 3 }
  );

  return fc
    .tuple(validEntriesArb, invalidEntriesArb, unknownEntriesArb)
    .map(([validEntries, invalidEntries, unknownEntries]) => {
      const draft: Record<string, unknown> = {};
      const expectedValid: Record<string, SurveyResponseValue> = {};

      // Add valid entries first
      for (const [id, value] of validEntries) {
        draft[id] = value;
        expectedValid[id] = value;
      }

      // Invalid entries overwrite valid ones if same ID (last write wins)
      for (const [id, value] of invalidEntries) {
        draft[id] = value;
        delete expectedValid[id];
      }

      // Unknown entries never appear in expected
      for (const [id, value] of unknownEntries) {
        draft[id] = value;
      }

      return { draft, expectedValid };
    });
};

describe('sanitizeDraft - property-based', () => {
  it('yields exactly the valid subset of entries, unchanged', () => {
    fc.assert(
      fc.property(
        surveyFieldsArb.chain((questions) =>
          draftWithMixedEntries(questions).map((data) => ({ questions, ...data }))
        ),
        ({ questions, draft, expectedValid }) => {
          const raw = JSON.stringify(draft);
          const result = sanitizeDraft(raw, questions);

          // Result contains exactly the valid entries
          expect(Object.keys(result).sort()).toEqual(Object.keys(expectedValid).sort());

          // Each retained value is preserved unchanged
          for (const [id, value] of Object.entries(expectedValid)) {
            expect(result[id]).toEqual(value);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('sanitizeDraft - structurally invalid drafts', () => {
  const questions: SurveyField[] = [{ id: 'q1', type: 'text', label: 'Q1' }];

  it('returns empty responses for structurally invalid draft inputs', () => {
    const structurallyInvalidArb = fc.oneof(
      // Invalid JSON strings (cannot be parsed)
      fc.string().filter((s) => {
        try {
          JSON.parse(s);
          return false;
        } catch {
          return true;
        }
      }),
      // JSON that parses to null
      fc.constant('null'),
      // JSON that parses to a primitive
      fc.oneof(
        fc.constant('42'),
        fc.constant('"hello"'),
        fc.constant('true'),
        fc.constant('false')
      ),
      // JSON that parses to an array
      fc.array(fc.anything()).map((a) => JSON.stringify(a)),
      // null input
      fc.constant(null),
      // Empty string
      fc.constant('')
    );

    fc.assert(
      fc.property(structurallyInvalidArb, (raw) => {
        const result = sanitizeDraft(raw, questions);
        expect(result).toEqual({});
        expect(Object.keys(result)).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });
});
