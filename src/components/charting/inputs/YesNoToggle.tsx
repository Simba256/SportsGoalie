'use client';

import { VoiceRecorder } from './VoiceRecorder';

interface YesNoToggleProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  label?: string;
  helpText?: string;
  /** Prompt shown when Yes is selected */
  yesVoicePrompt?: string;
  /** Prompt shown when No is selected */
  noVoicePrompt?: string;
  /** Callback when voice transcription is captured (either answer) */
  onVoiceComplete?: (text: string) => void;
  /** Initial voice note text (for editing) */
  initialVoiceText?: string;
  // Legacy props — kept for backwards compatibility
  triggerVoiceOn?: 'yes' | 'no';
  voicePrompt?: string;
}

export function YesNoToggle({
  value,
  onChange,
  yesVoicePrompt,
  noVoicePrompt,
  onVoiceComplete,
  initialVoiceText,
  triggerVoiceOn,
  voicePrompt,
}: YesNoToggleProps) {
  // Resolve the active prompt based on current answer
  const activePrompt = value === true
    ? (yesVoicePrompt ?? (triggerVoiceOn === 'yes' ? voicePrompt : undefined))
    : value === false
    ? (noVoicePrompt ?? (triggerVoiceOn === 'no' ? voicePrompt : undefined))
    : undefined;

  const showVoice = value !== null && !!activePrompt;

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

      {/* Voice recorder — shown for whichever answer has a prompt */}
      {showVoice && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm text-white/60 mb-2 italic">{activePrompt}</p>
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
