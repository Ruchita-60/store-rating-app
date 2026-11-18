import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  showScore = false,
  maxStars = 5,
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  const currentVal = hoverValue || value || 0;

  return (
    <div className="inline-flex items-center space-x-1.5">
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: maxStars }, (_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= (hoverValue || Math.round(value));
          const isPartiallyFilled = !hoverValue && starNumber > value && starNumber - 1 < value;

          return (
            <button
              key={starNumber}
              type="button"
              disabled={readOnly}
              onClick={() => {
                if (!readOnly && onChange) {
                  onChange(starNumber);
                }
              }}
              onMouseEnter={() => !readOnly && setHoverValue(starNumber)}
              onMouseLeave={() => !readOnly && setHoverValue(0)}
              className={`p-0.5 transition-all duration-150 ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-125 focus:outline-none'
              }`}
              title={readOnly ? `${value} out of 5 stars` : `Rate ${starNumber} star${starNumber > 1 ? 's' : ''}`}
            >
              <Star
                className={`${starSizes[size] || starSizes.md} transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                    : isPartiallyFilled
                    ? 'text-amber-400 fill-amber-200'
                    : 'text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="text-sm font-semibold text-slate-700 ml-1">
          {Number(value) > 0 ? Number(value).toFixed(1) : 'No ratings'}
          {Number(value) > 0 && <span className="text-xs text-slate-400 font-normal"> / 5</span>}
        </span>
      )}
    </div>
  );
};

export default StarRating;
