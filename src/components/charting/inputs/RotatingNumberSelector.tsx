'use client';

import { useEffect, useMemo, useRef } from 'react';

export interface SelectorOption {
  value: string | number;
  label: string;
}

interface RotatingNumberSelectorProps {
  value: string | number | null;
  onChange: (value: string | number) => void;
  options: SelectorOption[];
  label?: string;
  helpText?: string;
}

export function RotatingNumberSelector({
  value,
  onChange,
  options,
}: RotatingNumberSelectorProps) {
  const itemHeight = 48;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedIndex = useMemo(
    () => (value !== null ? options.findIndex((o) => o.value === value) : -1),
    [options, value]
  );

  // Scroll to selected item on mount / value change
  useEffect(() => {
    if (!containerRef.current || selectedIndex < 0) return;

    const targetScroll = selectedIndex * itemHeight;
    if (Math.abs(containerRef.current.scrollTop - targetScroll) > 1) {
      containerRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  }, [selectedIndex]);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="h-36 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 scrollbar-hide"
        aria-label="Scroll to browse, click to select"
      >
        {options.map((option, index) => {
          const isSelected = index === (selectedIndex >= 0 ? selectedIndex : 0);
          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => onChange(option.value)}
              className={`w-full h-12 px-3 text-sm text-left transition-colors truncate ${
                isSelected
                  ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-500'
                  : 'text-zinc-500 hover:bg-white hover:text-zinc-700'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
