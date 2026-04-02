'use client';

import { useState } from 'react';
import { Mic, Type, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MindVaultEntry } from '@/types/mind-vault';

interface Props {
  entry: MindVaultEntry;
  onDelete?: (id: string) => Promise<void>;
}

export function MindVaultEntryCard({ entry, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(entry.id);
    } finally {
      setDeleting(false);
    }
  };

  const date = entry.createdAt?.toDate?.()
    ? entry.createdAt.toDate()
    : new Date(entry.createdAt as unknown as string);

  return (
    <div className="group rounded-2xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/20 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {entry.content}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              {entry.isVoiceEntry ? (
                <>
                  <Mic className="h-3 w-3" />
                  Voice
                </>
              ) : (
                <>
                  <Type className="h-3 w-3" />
                  Text
                </>
              )}
            </span>
            <span className="text-xs text-slate-500">
              {date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {entry.source !== 'manual' && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {entry.source === 'post_game'
                  ? 'Post-Game'
                  : entry.source === 'pre_game'
                  ? 'Pre-Game'
                  : 'Practice'}
              </span>
            )}
          </div>
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
