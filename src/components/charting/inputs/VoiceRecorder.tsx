'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Square, Loader2, Pencil } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  initialText?: string;
  placeholder?: string;
}

// Extend Window for webkit prefixed SpeechRecognition
interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
  resultIndex: number;
}

export function VoiceRecorder({
  onTranscriptionComplete,
  initialText = '',
  placeholder = 'Tap the microphone to record...',
}: VoiceRecorderProps) {
  const [text, setText] = useState(initialText);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<unknown>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check for Speech Recognition support
  useEffect(() => {
    const SR = (window as unknown as Record<string, unknown>).SpeechRecognition ||
               (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      setIsEditing(true); // Fall back to manual text entry
    }
  }, []);

  const startRecording = useCallback(() => {
    const SR = (window as unknown as Record<string, unknown>).SpeechRecognition ||
               (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SR) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SR as any)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = text;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < Object.keys(event.results).length; i++) {
        const result = event.results[i];
        if (result[0]) {
          // Check if result is final by checking the isFinal property
          const resultObj = event.results[i] as unknown as { isFinal: boolean; [index: number]: { transcript: string } };
          if (resultObj.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          } else {
            interim += result[0].transcript;
          }
        }
      }
      setText(finalTranscript + interim);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsProcessing(false);
      if (finalTranscript.trim()) {
        setText(finalTranscript.trim());
        onTranscriptionComplete(finalTranscript.trim());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [text, onTranscriptionComplete]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recognitionRef.current as any).stop();
      setIsProcessing(true);
    }
  }, []);

  const handleTextChange = (newText: string) => {
    setText(newText);
    onTranscriptionComplete(newText);
  };

  return (
    <div className="space-y-3">
      {/* Mic button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || !supported}
          className={`
            relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
            ${isRecording
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30 scale-110'
              : isProcessing
              ? 'bg-white/15 text-white/40'
              : supported
              ? 'bg-white/10 text-white/60 hover:bg-[rgba(55,181,255,0.12)] hover:text-[#37b5ff] hover:shadow-sm'
              : 'bg-white/10 text-white/25 cursor-not-allowed'
            }
          `}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {/* Pulse ring when recording */}
          {isRecording && (
            <span className="absolute inset-0 rounded-full bg-red-600/30 animate-ping" />
          )}

          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isRecording ? (
            <Square className="w-3.5 h-3.5 fill-current" />
          ) : supported ? (
            <Mic className="w-4 h-4" />
          ) : (
            <MicOff className="w-4 h-4" />
          )}
        </button>

        <div className="flex-1 text-sm">
          {isRecording ? (
            <p className="text-red-600 font-medium">Recording... tap to stop</p>
          ) : isProcessing ? (
            <p className="text-white/50">Processing...</p>
          ) : !supported ? (
            <p className="text-white/40">Voice not available — type below</p>
          ) : text ? (
            <p className="text-white/50">Tap mic to re-record, or edit below</p>
          ) : (
            <p className="text-white/40">{placeholder}</p>
          )}
        </div>

        {/* Edit toggle (when there's text and not already editing) */}
        {text && !isEditing && !isRecording && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setTimeout(() => textareaRef.current?.focus(), 100);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/40 hover:text-[#37b5ff] hover:bg-[rgba(55,181,255,0.1)] transition-colors"
            aria-label="Edit transcription"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Transcription display / edit area */}
      {(text || isEditing || !supported) && (
        <div className="relative">
          {isEditing || !supported ? (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              onBlur={() => { if (supported && text) setIsEditing(false); }}
              placeholder={placeholder}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-white/12 bg-white/[0.06] text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 resize-none transition-colors"
            />
          ) : text ? (
            <div
              onClick={() => {
                setIsEditing(true);
                setTimeout(() => textareaRef.current?.focus(), 100);
              }}
              className="px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white/80 leading-relaxed cursor-pointer hover:bg-white/[0.08] transition-colors"
            >
              {text}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
