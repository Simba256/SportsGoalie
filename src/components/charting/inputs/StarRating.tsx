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
                  : 'text-white/25 hover:text-white/50'
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
          <span className="ml-1.5 text-xs font-bold text-white/80">
            {value}/{maxStars}
          </span>
        )}
      </div>

      {/* Tap hint */}
      {definitions.length > 0 && value !== null && (
        <p className="text-xs text-white/40">
          Tap a star again to see its definition
        </p>
      )}

      {/* Expanded definition panel */}
      {expandedDef && (
        <div
          className="rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ background: 'rgba(55,181,255,0.07)', border: '1px solid rgba(55,181,255,0.3)', borderLeft: '3px solid #37b5ff' }}
        >
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: expandedDef.rating }, (_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  ))}
                </div>
                <h4 className="text-sm font-bold text-white">{expandedDef.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setExpandedStar(null)}
                className="w-6 h-6 flex items-center justify-center rounded-md text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-sm text-white/75 leading-relaxed">{expandedDef.description}</p>
            {expandedDef.videoUrl && (
              <a
                href={expandedDef.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#37b5ff] hover:text-white mt-1"
              >
                <Play className="w-3.5 h-3.5" /> Watch example
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
