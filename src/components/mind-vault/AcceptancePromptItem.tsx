'use client';

import { useState } from 'react';
import { Check, Plus, Loader2 } from 'lucide-react';

interface Props {
  promptText: string;
  isAccepted: boolean;
  onAccept: (text: string) => Promise<void>;
}

export function AcceptancePromptItem({ promptText, isAccepted, onAccept }: Props) {
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
      className={`w-full text-left rounded-lg border px-4 py-3 transition-all duration-200 ${
        isAccepted
          ? 'border-emerald-200 bg-emerald-50 cursor-default'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
            isAccepted
              ? 'bg-emerald-500'
              : 'border-2 border-gray-300'
          }`}
        >
          {saving ? (
            <Loader2 className="h-3 w-3 text-gray-400 animate-spin" />
          ) : isAccepted ? (
            <Check className="h-3 w-3 text-white" />
          ) : (
            <Plus className="h-3 w-3 text-gray-400" />
          )}
        </div>
        <p className={`text-sm leading-relaxed ${
          isAccepted ? 'text-emerald-800 font-medium' : 'text-gray-700'
        }`}>
          {promptText}
        </p>
      </div>
    </button>
  );
}
