'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ShieldAlert } from 'lucide-react';
import { SkeletonListPage } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { mindVaultService } from '@/lib/database/services/mind-vault.service';
import { AcceptancePromptItem } from '@/components/mind-vault/AcceptancePromptItem';
import { MindVaultEntryForm } from '@/components/mind-vault/MindVaultEntryForm';
import { MindVaultEntryCard } from '@/components/mind-vault/MindVaultEntryCard';
import {
  CANNOT_ACCEPT_SUBCATEGORIES,
  CANNOT_ACCEPT_PROMPTS,
  type MindVaultEntry,
} from '@/types/mind-vault';
import { toast } from 'sonner';

export default function CannotAcceptListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [entries, setEntries] = useState<MindVaultEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>(() =>
    CANNOT_ACCEPT_SUBCATEGORIES.reduce<Record<string, boolean>>((acc, sub) => {
      acc[sub.slug] = true;
      return acc;
    }, {})
  );

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      const result = await mindVaultService.getEntriesByCategory(user.id, 'cannot_accept');
      if (result.success && result.data) {
        setEntries(result.data);
      } else {
        toast.error(result.error?.message || 'Failed to load Cannot Accept List');
      }
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const acceptedTexts = new Set(entries.map((e) => e.content));

  const handleAcceptPrompt = async (text: string, subcategory: string) => {
    if (!user?.id) {
      console.warn('[MindVault] No user ID available');
      return;
    }
    console.log('[MindVault] Adding cannot-accept entry:', { subcategory, text: text.substring(0, 40) });
    try {
      const result = await mindVaultService.addEntry({
        studentId: user.id,
        category: 'cannot_accept',
        subcategory,
        content: text,
        isVoiceEntry: false,
        source: 'manual',
      });
      console.log('[MindVault] addEntry result:', result);
      if (result.success) {
        const reload = await mindVaultService.getEntriesByCategory(user.id, 'cannot_accept');
        if (reload.success && reload.data) setEntries(reload.data);
      } else {
        const msg = result.error?.message || result.message || 'Failed to add entry';
        console.warn('[MindVault] addEntry failed:', {
          code: result.error?.code || 'UNKNOWN_ERROR',
          message: msg,
          details: result.error?.details,
        });
        toast.error(msg);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn('[MindVault] addEntry threw:', { message: msg, error });
      toast.error(msg);
    }
  };

  const handleAddCustom = async (content: string, isVoice: boolean) => {
    if (!user?.id) return;
    const result = await mindVaultService.addEntry({
      studentId: user.id,
      category: 'cannot_accept',
      content,
      isVoiceEntry: isVoice,
      source: 'manual',
    });
    if (result.success) {
      const reload = await mindVaultService.getEntriesByCategory(user.id, 'cannot_accept');
      if (reload.success && reload.data) setEntries(reload.data);
    } else {
      const msg = result.error?.message || result.message || 'Failed to add entry';
      console.warn('[MindVault] custom addEntry failed:', {
        code: result.error?.code || 'UNKNOWN_ERROR',
        message: msg,
        details: result.error?.details,
      });
      toast.error(msg);
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

  const promptTexts = new Set(CANNOT_ACCEPT_PROMPTS.map((p) => p.text));
  const customEntries = entries.filter((e) => !promptTexts.has(e.content));

  if (loading) {
    return (
      <div className="py-4">
        <SkeletonListPage cols={2} count={4} />
      </div>
    );
  }

  return (
    <div className="relative max-w-6xl mx-auto overflow-hidden rounded-3xl border border-red-100/80 bg-gradient-to-b from-white via-red-50/15 to-white p-5 shadow-[0_24px_60px_-40px_rgba(239,68,68,0.35)] sm:p-8">
      <div className="pointer-events-none absolute -top-24 -right-20 h-52 w-52 rounded-full bg-red-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 mb-6 rounded-2xl border border-red-200/70 bg-white/90 p-5 backdrop-blur">
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 rounded-full border border-red-200 bg-red-50 px-4 text-red-700 hover:border-red-300 hover:bg-red-100 hover:text-red-800"
          onClick={() => router.push('/mind-vault')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Mind Vault
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-md shadow-red-500/25">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cannot Accept List</h1>
            <p className="text-sm text-slate-600">
              Your psychological firewall — what you consciously refuse to surrender to.
            </p>
          </div>
        </div>
        <p className="mt-3 ml-[52px] inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
          These are your non-negotiables. Tap to claim them, or add your own.
        </p>
      </div>

      <div className="relative z-10 mb-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-red-900">Expandable Index</h2>
        <p className="mt-1 text-sm leading-relaxed text-red-900/90">
          Your psychological firewall grows as new pressure points appear. Add entries after
          difficult games, practices, or personal moments so your non-negotiables stay clear,
          specific, and strong.
        </p>
      </div>

      {/* Sub-categories with prompts */}
      <div className="relative z-10 space-y-6">
        {CANNOT_ACCEPT_SUBCATEGORIES.map((sub) => {
          const prompts = CANNOT_ACCEPT_PROMPTS.filter((p) => p.subcategory === sub.slug);
          const isExpanded = expandedSubcategories[sub.slug];
          const acceptedCount = prompts.filter((prompt) => acceptedTexts.has(prompt.text)).length;
          return (
            <div key={sub.slug} className="rounded-2xl border border-red-100 bg-white/90 p-4 shadow-sm">
              <button
                type="button"
                onClick={() => toggleSubcategory(sub.slug)}
                className="mb-2 flex w-full items-center justify-between rounded-xl border border-red-200 bg-gradient-to-r from-red-50/80 to-white px-4 py-3 text-left hover:border-red-300"
                aria-expanded={isExpanded}
              >
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{sub.name}</h2>
                  <p className="text-xs text-slate-500">{sub.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-red-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-red-700">
                    {acceptedCount}/{prompts.length}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-red-600 transition-transform ${
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
                      variant="red"
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
        <div className="relative z-10 mt-8 rounded-2xl border border-red-100 bg-white/90 p-4 shadow-sm">
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
          placeholder="Add your own non-negotiable in your own words..."
        />
      </div>
    </div>
  );
}
