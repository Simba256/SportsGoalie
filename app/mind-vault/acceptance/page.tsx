'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, Heart, Loader2 } from 'lucide-react';
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
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>(() =>
    ACCEPTANCE_SUBCATEGORIES.reduce<Record<string, boolean>>((acc, sub) => {
      acc[sub.slug] = true;
      return acc;
    }, {})
  );

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
    if (!user?.id) {
      console.error('[MindVault] No user ID available');
      return;
    }
    console.log('[MindVault] Adding acceptance entry:', { subcategory, text: text.substring(0, 40) });
    try {
      const result = await mindVaultService.addEntry({
        studentId: user.id,
        category: 'acceptance',
        subcategory,
        content: text,
        isVoiceEntry: false,
        source: 'manual',
      });
      console.log('[MindVault] addEntry result:', result);
      if (result.success) {
        const reload = await mindVaultService.getEntriesByCategory(user.id, 'acceptance');
        if (reload.success && reload.data) setEntries(reload.data);
      } else {
        console.error('[MindVault] addEntry failed:', result.error);
      }
    } catch (error) {
      console.error('[MindVault] addEntry threw:', error);
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

  const toggleSubcategory = (slug: string) => {
    setExpandedSubcategories((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
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
    <div className="relative max-w-6xl mx-auto overflow-hidden rounded-3xl border border-blue-100/80 bg-gradient-to-b from-white via-blue-50/15 to-white p-5 shadow-[0_24px_60px_-40px_rgba(14,116,244,0.35)] sm:p-8">
      <div className="pointer-events-none absolute -top-24 -right-20 h-52 w-52 rounded-full bg-blue-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-red-400/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 mb-6 rounded-2xl border border-blue-200/70 bg-white/90 p-5 backdrop-blur">
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 rounded-full border border-blue-200 bg-blue-50 px-4 text-blue-700 hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800"
          onClick={() => router.push('/mind-vault')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Mind Vault
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/25">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Acceptance List</h1>
            <p className="text-sm text-slate-600">
              What you have made peace with — your foundation of mental strength.
            </p>
          </div>
        </div>
        <p className="mt-3 ml-[52px] inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Tap a prompt to accept it, or add your own in your own words.
        </p>
      </div>

      <div className="relative z-10 mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-blue-900">Expandable Index</h2>
        <p className="mt-1 text-sm leading-relaxed text-blue-900/90">
          The goalie adds their own acceptance items to each category as they encounter new
          challenges. The platform prompts them after difficult games, practices, or personal
          events. The vault grows. The armor strengthens.
        </p>
      </div>

      {/* Sub-categories with prompts */}
      <div className="relative z-10 space-y-6">
        {ACCEPTANCE_SUBCATEGORIES.map((sub) => {
          const prompts = ACCEPTANCE_PROMPTS.filter((p) => p.subcategory === sub.slug);
          const isExpanded = expandedSubcategories[sub.slug];
          const acceptedCount = prompts.filter((prompt) => acceptedTexts.has(prompt.text)).length;
          return (
            <div key={sub.slug} className="rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-sm">
              <button
                type="button"
                onClick={() => toggleSubcategory(sub.slug)}
                className="mb-2 flex w-full items-center justify-between rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-white px-4 py-3 text-left hover:border-blue-300"
                aria-expanded={isExpanded}
              >
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{sub.name}</h2>
                  <p className="text-xs text-slate-500">{sub.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                    {acceptedCount}/{prompts.length}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-blue-600 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              {isExpanded && (
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
              )}
            </div>
          );
        })}
      </div>

      {/* Custom entries */}
      {customEntries.length > 0 && (
        <div className="relative z-10 mt-8 rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Your Custom Entries</h2>
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
      <div className="relative z-10 mt-6">
        <MindVaultEntryForm
          onSubmit={handleAddCustom}
          placeholder="Add your own acceptance in your own words..."
        />
      </div>
    </div>
  );
}
