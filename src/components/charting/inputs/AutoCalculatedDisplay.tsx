'use client';

import { Calculator } from 'lucide-react';

interface AutoCalculatedDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function AutoCalculatedDisplay({
  label,
  value,
  unit,
  description,
  icon,
}: AutoCalculatedDisplayProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          {icon || <Calculator className="w-4.5 h-4.5 text-blue-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-black text-zinc-900">
            {value}
            {unit && <span className="text-sm font-medium text-zinc-500 ml-1">{unit}</span>}
          </p>
          {description && (
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
