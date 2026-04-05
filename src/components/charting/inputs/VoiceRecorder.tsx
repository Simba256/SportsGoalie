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
              ? 'bg-zinc-300 text-zinc-500'
              : supported
              ? 'bg-zinc-100 text-zinc-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm'
              : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
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
            <p className="text-zinc-500">Processing...</p>
          ) : !supported ? (
            <p className="text-zinc-400">Voice not available — type below</p>
          ) : text ? (
            <p className="text-zinc-500">Tap mic to re-record, or edit below</p>
          ) : (
            <p className="text-zinc-400">{placeholder}</p>
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
            className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
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
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none transition-colors"
            />
          ) : text ? (
            <div
              onClick={() => {
                setIsEditing(true);
                setTimeout(() => textareaRef.current?.focus(), 100);
              }}
              className="px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-700 leading-relaxed cursor-pointer hover:bg-zinc-100 transition-colors"
            >
              {text}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
