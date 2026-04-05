'use client';

import { useState } from 'react';
import { Check, Plus, Loader2 } from 'lucide-react';

interface Props {
  promptText: string;
  isAccepted: boolean;
  onAccept: (text: string) => Promise<void>;
  variant?: 'blue' | 'red';
}

export function AcceptancePromptItem({
  promptText,
  isAccepted,
  onAccept,
  variant = 'blue',
}: Props) {
  const [saving, setSaving] = useState(false);

  const handleAccept = async () => {
    if (isAccepted || saving) return;
    setSaving(true);
    try {
      await onAccept(promptText);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAccept}
      disabled={isAccepted || saving}
      className={`w-full text-left rounded-xl border px-4 py-3 transition-all duration-300 ${
        isAccepted
          ? variant === 'red'
            ? 'border-red-200 bg-gradient-to-r from-red-50 to-white cursor-default'
            : 'border-blue-200 bg-gradient-to-r from-blue-50 to-white cursor-default'
          : variant === 'red'
          ? 'border-gray-200 bg-white hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50/30 cursor-pointer'
          : 'border-gray-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
            isAccepted
              ? variant === 'red'
                ? 'bg-red-500'
                : 'bg-blue-500'
              : 'border-2 border-gray-300'
          }`}
        >
          {saving ? (
            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
          ) : isAccepted ? (
            <Check className="h-3 w-3 text-white" />
          ) : (
            <Plus className="h-3 w-3 text-gray-400" />
          )}
        </div>
        <p className={`text-sm leading-relaxed ${
          isAccepted
            ? variant === 'red'
              ? 'text-red-800 font-medium'
              : 'text-blue-800 font-medium'
            : 'text-gray-700'
        }`}>
          {promptText}
        </p>
      </div>
    </button>
  );
}
