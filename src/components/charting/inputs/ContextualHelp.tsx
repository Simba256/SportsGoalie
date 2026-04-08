'use client';

import { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface ContextualHelpProps {
  label: string;
  helpText: string;
  children: React.ReactNode;
}

export function ContextualHelp({ label, helpText, children }: ContextualHelpProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-zinc-800">{label}</span>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-zinc-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          aria-label={`Help for ${label}`}
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Help panel */}
      {open && (
        <div
          ref={panelRef}
          className="relative bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-zinc-700 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="pr-5">{helpText}</p>
        </div>
      )}

      {/* Field content */}
      {children}
    </div>
  );
}
