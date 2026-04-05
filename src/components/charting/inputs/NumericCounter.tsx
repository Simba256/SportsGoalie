'use client';

import { Minus, Plus } from 'lucide-react';

interface NumericCounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  onIncrement?: (newValue: number) => void;
}

export function NumericCounter({
  value,
  onChange,
  min = 0,
  max = 20,
  onIncrement,
}: NumericCounterProps) {
  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increment = () => {
    if (value < max) {
      const newVal = value + 1;
      onChange(newVal);
      onIncrement?.(newVal);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Minus button */}
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-zinc-600 hover:bg-gray-200 active:scale-95 disabled:opacity-30 disabled:hover:bg-gray-100 transition-all"
        aria-label="Decrease"
      >
        <Minus className="w-4 h-4" />
      </button>

      {/* Value display */}
      <div className="w-12 h-10 rounded-lg bg-white border-2 border-zinc-200 flex items-center justify-center">
        <span className="text-lg font-black text-zinc-900">{value}</span>
      </div>

      {/* Plus button */}
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 active:scale-95 disabled:opacity-30 disabled:hover:bg-blue-500 transition-all shadow-sm shadow-blue-500/20"
        aria-label="Increase"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
