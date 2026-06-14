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
    <div className="bg-[rgba(55,181,255,0.08)] border border-[rgba(55,181,255,0.2)] rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[rgba(55,181,255,0.12)] flex items-center justify-center flex-shrink-0">
          {icon || <Calculator className="w-4.5 h-4.5 text-[#37b5ff]" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#37b5ff] uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-black text-white">
            {value}
            {unit && <span className="text-sm font-medium text-white/50 ml-1">{unit}</span>}
          </p>
          {description && (
            <p className="text-xs text-white/50 mt-1 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
