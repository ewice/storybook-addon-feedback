import { StarIcon } from '@storybook/icons';
import React, { useState } from 'react';
import { styled } from 'storybook/theming';
import { focusRing } from '../../ui';

const StarsContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  padding: '4px 0'
});

const VisuallyHiddenInput = styled.input({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0
});

const StarOption = styled.label<{ active: boolean; hoverActive: boolean }>(
  ({ theme, active, hoverActive }) => {
    return {
      alignItems: 'center',
      borderRadius: theme.appBorderRadius,
      color: hoverActive || active ? theme.color.gold : theme.borderColor.default,
      cursor: 'pointer',
      display: 'inline-flex',
      height: '44px',
      justifyContent: 'center',
      padding: 0,
      position: 'relative',
      width: '44px',
      transition:
        'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.1s, background-color 0.15s',
      '&:hover': {
        transform: 'scale(1.15)',
        backgroundColor: theme.background.hoverable
      },
      '&:has(input:focus-visible)': focusRing(theme)
    };
  }
);

interface StarRatingInputProps {
  name: string;
  value: number;
  onChange: (rating: number) => void;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export const StarRatingInput = React.forwardRef<HTMLInputElement, StarRatingInputProps>(
  ({ name, value, onChange, ariaDescribedBy, ariaInvalid }, ref) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <StarsContainer>
        {[1, 2, 3, 4, 5].map((starValue) => {
          const active = value >= starValue;
          const hoverActive = hoverRating >= starValue;
          return (
            <StarOption
              key={starValue}
              active={active}
              hoverActive={hoverActive}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              onFocus={() => setHoverRating(starValue)}
              onBlur={() => setHoverRating(0)}
            >
              <VisuallyHiddenInput
                ref={starValue === 1 ? ref : undefined}
                id={`${name}-${starValue}`}
                type="radio"
                name={name}
                value={String(starValue)}
                checked={value === starValue}
                onChange={() => onChange(starValue)}
                aria-label={`${starValue} out of 5 stars`}
                aria-describedby={ariaDescribedBy}
                aria-invalid={ariaInvalid || undefined}
              />
              <StarIcon />
            </StarOption>
          );
        })}
      </StarsContainer>
    );
  }
);

StarRatingInput.displayName = 'StarRatingInput';
