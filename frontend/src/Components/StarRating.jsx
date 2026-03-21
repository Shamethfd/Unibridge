import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 24 }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={`transition-all duration-150 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          >
            <FiStar
              size={size}
              className={`transition-colors duration-150 ${
                filled
                  ? 'fill-warning-400 text-warning-400'
                  : 'fill-none text-neutral-300'
              }`}
            />
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-sm font-gilroyMedium text-neutral-500">
          {value}/5
        </span>
      )}
    </div>
  );
}
