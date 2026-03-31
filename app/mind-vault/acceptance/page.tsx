'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { mindVaultService } from '@/lib/database/services/mind-vault.service';
import { AcceptancePromptItem } from '@/components/mind-vault/AcceptancePromptItem';
import { MindVaultEntryForm } from '@/components/mind-vault/MindVaultEntryForm';
import { MindVaultEntryCard } from '@/components/mind-vault/MindVaultEntryCard';
import {
  ACCEPTANCE_SUBCATEGORIES,
  ACCEPTANCE_PROMPTS,
  type MindVaultEntry,
} from '@/types/mind-vault';

export default function AcceptanceListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [entries, setEntries] = useState<MindVaultEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      const result = await mindVaultService.getEntriesByCategory(user.id, 'acceptance');
      if (result.success && result.data) {
        setEntries(result.data);
      }
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const acceptedTexts = new Set(entries.map((e) => e.content));

  const handleAcceptPrompt = async (text: string, subcategory: string) => {
    if (!user?.id) return;
    const result = await mindVaultService.addEntry({
      studentId: user.id,
      category: 'acceptance',
      subcategory,
      content: text,
      isVoiceEntry: false,
      source: 'manual',
    });
    if (result.success) {
      const reload = await mindVaultService.getEntriesByCategory(user.id, 'acceptance');
      if (reload.success && reload.data) setEntries(reload.data);
    }
  };

  const handleAddCustom = async (content: string, isVoice: boolean) => {
    if (!user?.id) return;
    const result = await mindVaultService.addEntry({
      studentId: user.id,
      category: 'acceptance',
      content,
      isVoiceEntry: isVoice,
      source: 'manual',
    });
    if (result.success) {
      const reload = await mindVaultService.getEntriesByCategory(user.id, 'acceptance');
      if (reload.success && reload.data) setEntries(reload.data);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    await mindVaultService.deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Custom entries = entries whose content doesn't match any prompt
  const promptTexts = new Set(ACCEPTANCE_PROMPTS.map((p) => p.text));
  const customEntries = entries.filter((e) => !promptTexts.has(e.content));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 text-gray-500"
          onClick={() => router.push('/mind-vault')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Mind Vault
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Heart className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Acceptance List</h1>
            <p className="text-sm text-gray-500">
              What you have made peace with — your foundation of mental strength.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 ml-[52px]">
          Tap a prompt to accept it, or add your own in your own words.
        </p>
      </div>

      {/* Sub-categories with prompts */}
      <div className="space-y-8">
        {ACCEPTANCE_SUBCATEGORIES.map((sub) => {
          const prompts = ACCEPTANCE_PROMPTS.filter((p) => p.subcategory === sub.slug);
          return (
            <div key={sub.slug}>
              <div className="mb-3">
                <h2 className="text-sm font-semibold text-gray-900">{sub.name}</h2>
                <p className="text-xs text-gray-400">{sub.description}</p>
              </div>
              <div className="space-y-2">
                {prompts.map((prompt) => (
                  <AcceptancePromptItem
                    key={prompt.id}
                    promptText={prompt.text}
                    isAccepted={acceptedTexts.has(prompt.text)}
                    onAccept={(text) => handleAcceptPrompt(text, sub.slug)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom entries */}
      {customEntries.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Your Custom Entries</h2>
          <div className="space-y-3">
            {customEntries.map((entry) => (
              <MindVaultEntryCard
                key={entry.id}
                entry={entry}
                onDelete={handleDeleteEntry}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add custom entry */}
      <div className="mt-6">
        <MindVaultEntryForm
          onSubmit={handleAddCustom}
          placeholder="Add your own acceptance in your own words..."
        />
      </div>
    </div>
  );
}
