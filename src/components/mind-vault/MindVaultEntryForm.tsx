'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceRecorder } from '@/components/charting/inputs/VoiceRecorder';

interface Props {
  onSubmit: (content: string, isVoice: boolean) => Promise<void>;
  placeholder?: string;
}

export function MindVaultEntryForm({ onSubmit, placeholder }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isVoice, setIsVoice] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleTranscription = (text: string) => {
    setContent(text);
    setIsVoice(true);
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await onSubmit(content.trim(), isVoice);
      setContent('');
      setIsVoice(false);
      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full rounded-xl border-dashed border-blue-300 bg-white text-blue-700 transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Entry
      </Button>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50/60 to-white p-4 shadow-sm">
      <VoiceRecorder
        onTranscriptionComplete={handleTranscription}
        initialText={content}
        placeholder={placeholder || 'Speak or type your entry...'}
      />

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false);
            setContent('');
            setIsVoice(false);
          }}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !content.trim()}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            'Save to Vault'
          )}
        </Button>
      </div>
    </div>
  );
}
