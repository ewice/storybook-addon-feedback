import React, { useState } from 'react';
import { styled } from 'storybook/theming';
import { focusRing } from '../ui/styles';

const StarsContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 0',
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
  border: 0,
});

const StarOption = styled.label<{ active: boolean; hoverActive: boolean }>(({ theme, active, hoverActive }) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '44px',
  minHeight: '44px',
  borderRadius: '6px',
  cursor: 'pointer',
  padding: 0,
  color: hoverActive || active ? theme.barSelectedColor : theme.appBorderColor,
  transition: 'transform 0.1s, color 0.1s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.15)',
  },
  '&:focus-within': focusRing(theme),
}));

const StarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

interface StarRatingInputProps {
  name: string;
  value: number;
  onChange: (rating: number) => void;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export const StarRatingInput: React.FC<StarRatingInputProps> = ({
  name,
  value,
  onChange,
  ariaDescribedBy,
  ariaInvalid,
}) => {
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
};
