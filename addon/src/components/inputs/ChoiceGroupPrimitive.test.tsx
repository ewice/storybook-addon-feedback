import { render, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import { createRef } from 'react';
import { ThemeProvider, convert, themes } from 'storybook/theming';
import { describe, it, expect } from 'vite-plus/test';
import { ChoiceGroupPrimitive } from './ChoiceGroupPrimitive';

const theme = convert(themes.light);

describe('ChoiceGroupPrimitive - Property 15: Radio mode single-select invariant', () => {
  it('marks at most one option as checked in radio mode', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 0, maxLength: 20 }),
        (options, value) => {
          const { container } = render(
            <ThemeProvider theme={theme}>
              <ChoiceGroupPrimitive
                mode="radio"
                name="test-radio"
                options={options}
                value={value}
                onChange={() => {}}
              />
            </ThemeProvider>
          );
          const checkedInputs = container.querySelectorAll('input[type="radio"]:checked');
          expect(checkedInputs.length).toBeLessThanOrEqual(1);
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('ChoiceGroupPrimitive - Property 16: Checkbox mode multi-select invariant', () => {
  it('marks exactly the options in values as checked in checkbox mode', () => {
    fc.assert(
      fc.property(
        fc
          .uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), {
            minLength: 1,
            maxLength: 10
          })
          .chain((options) => fc.tuple(fc.constant(options), fc.subarray(options))),
        ([options, selectedValues]) => {
          const { container } = render(
            <ThemeProvider theme={theme}>
              <ChoiceGroupPrimitive
                mode="checkbox"
                name="test-checkbox"
                options={options}
                value={selectedValues}
                onChange={() => {}}
              />
            </ThemeProvider>
          );
          const inputs = container.querySelectorAll('input[type="checkbox"]');
          expect(inputs.length).toBe(options.length);

          inputs.forEach((input, index) => {
            const isChecked = (input as HTMLInputElement).checked;
            const shouldBeChecked = selectedValues.includes(options[index]);
            expect(isChecked).toBe(shouldBeChecked);
          });
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('ChoiceGroupPrimitive - Property 17: Ref attaches to exactly the first option or none', () => {
  it('attaches ref to the first option control for non-empty options', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('radio' as const, 'checkbox' as const),
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), {
          minLength: 1,
          maxLength: 10
        }),
        (mode, options) => {
          const ref = createRef<HTMLInputElement>();
          render(
            <ThemeProvider theme={theme}>
              <ChoiceGroupPrimitive
                mode={mode}
                name="test-ref"
                options={options}
                value={mode === 'radio' ? '' : []}
                onChange={() => {}}
                ref={ref}
              />
            </ThemeProvider>
          );
          expect(ref.current).not.toBeNull();
          expect(ref.current?.id).toBe('test-ref-0');
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('does not attach ref when options array is empty', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <ThemeProvider theme={theme}>
        <ChoiceGroupPrimitive
          mode="radio"
          name="test-ref-empty"
          options={[]}
          value=""
          onChange={() => {}}
          ref={ref}
        />
      </ThemeProvider>
    );
    expect(ref.current).toBeNull();
  });
});

import { CheckboxGroupInput } from './CheckboxGroupInput';
import { RadioGroupInput } from './RadioGroupInput';

describe('Choice-group equivalence - Integration', () => {
  it('RadioGroupInput renders correct option controls with ARIA and identifiers', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RadioGroupInput
          name="radio-test"
          options={['Alpha', 'Beta', 'Gamma']}
          value="Beta"
          onChange={() => {}}
          ariaDescribedBy="error-id"
          ariaInvalid={true}
        />
      </ThemeProvider>
    );

    const radios = container.querySelectorAll('input[type="radio"]');
    expect(radios.length).toBe(3);

    expect(radios[0].id).toBe('radio-test-0');
    expect(radios[1].id).toBe('radio-test-1');
    expect(radios[2].id).toBe('radio-test-2');

    expect((radios[0] as HTMLInputElement).checked).toBe(false);
    expect((radios[1] as HTMLInputElement).checked).toBe(true);
    expect((radios[2] as HTMLInputElement).checked).toBe(false);

    radios.forEach((radio) => {
      expect(radio.getAttribute('aria-describedby')).toBe('error-id');
      expect(radio.getAttribute('aria-invalid')).toBe('true');
    });

    radios.forEach((radio) => {
      expect(radio.getAttribute('name')).toBe('radio-test');
    });
  });

  it('CheckboxGroupInput renders correct option controls with ARIA and identifiers', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <CheckboxGroupInput
          name="checkbox-test"
          options={['Red', 'Green', 'Blue']}
          values={['Red', 'Blue']}
          onChange={() => {}}
          ariaDescribedBy="help-text"
          ariaInvalid={false}
        />
      </ThemeProvider>
    );

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(3);

    expect(checkboxes[0].id).toBe('checkbox-test-0');
    expect(checkboxes[1].id).toBe('checkbox-test-1');
    expect(checkboxes[2].id).toBe('checkbox-test-2');

    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
    expect((checkboxes[2] as HTMLInputElement).checked).toBe(true);

    checkboxes.forEach((checkbox) => {
      expect(checkbox.getAttribute('aria-describedby')).toBe('help-text');
      expect(checkbox.getAttribute('aria-invalid')).toBeNull();
    });
  });

  it('RadioGroupInput with no value has no checked option', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RadioGroupInput name="radio-empty-val" options={['A', 'B']} value="" onChange={() => {}} />
      </ThemeProvider>
    );
    const checked = container.querySelectorAll('input[type="radio"]:checked');
    expect(checked.length).toBe(0);
  });

  it('CheckboxGroupInput with empty values has no checked option', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <CheckboxGroupInput
          name="checkbox-empty-val"
          options={['X', 'Y']}
          values={[]}
          onChange={() => {}}
        />
      </ThemeProvider>
    );
    const checked = container.querySelectorAll('input[type="checkbox"]:checked');
    expect(checked.length).toBe(0);
  });
});
