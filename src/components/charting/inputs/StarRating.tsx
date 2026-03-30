'use client';

import { useState } from 'react';
import { Star, X, Play } from 'lucide-react';

export interface StarDefinition {
  rating: number;
  title: string;
  description: string;
  videoUrl?: string;
}

interface StarRatingProps {
  value: number | null;
  onChange: (value: number) => void;
  definitions?: StarDefinition[];
  maxStars?: number;
}

export function StarRating({
  value,
  onChange,
  definitions = [],
  maxStars = 5,
}: StarRatingProps) {
  const [expandedStar, setExpandedStar] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleStarClick = (rating: number) => {
    if (value === rating) {
      // Tap same star again → toggle definition
      setExpandedStar(expandedStar === rating ? null : rating);
    } else {
      onChange(rating);
      setExpandedStar(null);
    }
  };

  const displayValue = hoveredStar ?? value ?? 0;
  const expandedDef = definitions.find(d => d.rating === expandedStar);

  return (
    <div className="space-y-3">
      {/* Stars row */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: maxStars }, (_, i) => {
          const rating = i + 1;
          const isFilled = rating <= displayValue;
          return (
            <button
              key={rating}
              type="button"
              onClick={() => handleStarClick(rating)}
              onMouseEnter={() => setHoveredStar(rating)}
              onMouseLeave={() => setHoveredStar(null)}
              className={`
                w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150
                ${isFilled
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-300 hover:text-gray-400'
                }
                ${value === rating ? 'ring-1.5 ring-red-300 ring-offset-1' : ''}
                hover:scale-110 active:scale-95
              `}
              aria-label={`Rate ${rating} of ${maxStars}`}
            >
              <Star
                className="w-5 h-5"
                fill={isFilled ? 'currentColor' : 'none'}
                strokeWidth={1.5}
              />
            </button>
          );
        })}

        {value !== null && (
          <span className="ml-1.5 text-xs font-bold text-zinc-700">
            {value}/{maxStars}
          </span>
        )}
      </div>

      {/* Tap hint */}
      {definitions.length > 0 && value !== null && (
        <p className="text-xs text-zinc-400">
          Tap a star again to see its definition
        </p>
      )}

      {/* Expanded definition panel */}
      {expandedDef && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: expandedDef.rating }, (_, i) => (
                  <Star key={i} className="w-4 h-4 text-red-500 fill-red-500" />
                ))}
              </div>
              <h4 className="text-sm font-bold text-zinc-800">{expandedDef.title}</h4>
            </div>
            <button
              type="button"
              onClick={() => setExpandedStar(null)}
              className="text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed">{expandedDef.description}</p>
          {expandedDef.videoUrl && (
            <a
              href={expandedDef.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-1"
            >
              <Play className="w-3.5 h-3.5" /> Watch example
            </a>
          )}
        </div>
      )}
    </div>
  );
}
