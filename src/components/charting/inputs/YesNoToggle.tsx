'use client';

import { useState, useEffect } from 'react';
import { VoiceRecorder } from './VoiceRecorder';

interface YesNoToggleProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  label?: string;
  helpText?: string;
  /** Which value triggers the voice follow-up */
  triggerVoiceOn?: 'yes' | 'no';
  /** Prompt shown above the voice recorder when triggered */
  voicePrompt?: string;
  /** Callback when voice transcription is captured */
  onVoiceComplete?: (text: string) => void;
  /** Initial voice note text (for editing) */
  initialVoiceText?: string;
}

export function YesNoToggle({
  value,
  onChange,
  triggerVoiceOn,
  voicePrompt,
  onVoiceComplete,
  initialVoiceText,
}: YesNoToggleProps) {
  const [showVoice, setShowVoice] = useState(false);

  // Show voice when trigger condition is met
  useEffect(() => {
    if (value === null || !triggerVoiceOn) {
      setShowVoice(false);
      return;
    }
    const shouldShow =
      (triggerVoiceOn === 'yes' && value === true) ||
      (triggerVoiceOn === 'no' && value === false);
    setShowVoice(shouldShow);
  }, [value, triggerVoiceOn]);

  return (
    <div className="space-y-3">
      {/* Toggle buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`
            px-5 h-9 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200
            ${value === true
              ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/25'
              : 'bg-white/10 text-white/55 hover:bg-white/15'
            }
          `}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`
            px-5 h-9 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200
            ${value === false
              ? 'bg-red-600 text-white shadow-sm shadow-red-600/25'
              : 'bg-white/10 text-white/55 hover:bg-white/15'
            }
          `}
        >
          No
        </button>
      </div>

      {/* Conditional voice recorder */}
      {showVoice && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          {voicePrompt && (
            <p className="text-sm text-white/60 mb-2 italic">{voicePrompt}</p>
          )}
          <VoiceRecorder
            onTranscriptionComplete={(text) => onVoiceComplete?.(text)}
            initialText={initialVoiceText}
            placeholder="Tap the microphone to record your response..."
          />
        </div>
      )}
    </div>
  );
}
