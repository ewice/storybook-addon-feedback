import { render } from '@testing-library/react';
import fc from 'fast-check';
import { ThemeProvider, convert, themes } from 'storybook/theming';
import { describe, it, expect } from 'vite-plus/test';
import { MAX_STAR_RATING } from '../../constants';
import { StarRatingInput } from './StarRatingInput';

const theme = convert(themes.light);

describe('StarRatingInput - Property 18: Star control count equals MAX_STAR_RATING', () => {
  it('renders exactly MAX_STAR_RATING radio inputs for any value', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: MAX_STAR_RATING }), (value) => {
        const { container } = render(
          <ThemeProvider theme={theme}>
            <StarRatingInput name="test-stars" value={value} onChange={() => {}} />
          </ThemeProvider>
        );
        const radios = container.querySelectorAll('input[type="radio"]');
        expect(radios.length).toBe(MAX_STAR_RATING);
      }),
      { numRuns: 100 }
    );
  });
});
