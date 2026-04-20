'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SkeletonListPage } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { mindVaultService } from '@/lib/database/services/mind-vault.service';
import { MindVaultEntryCard } from '@/components/mind-vault/MindVaultEntryCard';
import { MindVaultEntryForm } from '@/components/mind-vault/MindVaultEntryForm';
import {
  getMindVaultCategoryInfo,
  type MindVaultCategory,
  type MindVaultEntry,
} from '@/types/mind-vault';
import { toast } from 'sonner';

export default function MindVaultCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const categorySlug = params.category as MindVaultCategory;
  const categoryInfo = getMindVaultCategoryInfo(categorySlug);

  const [entries, setEntries] = useState<MindVaultEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !categorySlug) return;

    // Redirect acceptance/cannot_accept to their dedicated pages
    if (categorySlug === 'acceptance') {
      router.replace('/mind-vault/acceptance');
      return;
    }
    if (categorySlug === 'cannot_accept') {
      router.replace('/mind-vault/cannot-accept');
      return;
    }

    const load = async () => {
      setLoading(true);
      const result = await mindVaultService.getEntriesByCategory(user.id, categorySlug);
      if (result.success && result.data) {
        setEntries(result.data);
      } else {
        toast.error(result.error?.message || 'Failed to load entries');
      }
      setLoading(false);
    };
    load();
  }, [user?.id, categorySlug, router]);

  const handleAddEntry = async (content: string, isVoice: boolean) => {
    if (!user?.id) return;
    const result = await mindVaultService.addEntry({
      studentId: user.id,
      category: categorySlug,
      content,
      isVoiceEntry: isVoice,
      source: 'manual',
    });
    if (result.success) {
      const reload = await mindVaultService.getEntriesByCategory(user.id, categorySlug);
      if (reload.success && reload.data) {
        setEntries(reload.data);
      }
    } else {
      toast.error(result.error?.message || 'Failed to add entry');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    await mindVaultService.deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  if (!categoryInfo) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-gray-500">Category not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/mind-vault')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Mind Vault
        </Button>
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
        <h1 className="text-2xl font-bold text-gray-900">{categoryInfo.name}</h1>
        <p className="mt-1 text-sm text-slate-600">{categoryInfo.description}</p>
      </div>

      {/* Add Entry Form */}
      <div className="relative z-10 mb-6">
        <MindVaultEntryForm
          onSubmit={handleAddEntry}
          placeholder={`What would you like to add to ${categoryInfo.shortName}?`}
        />
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="relative z-10 py-4">
          <SkeletonListPage cols={2} count={4} />
        </div>
      ) : entries.length === 0 ? (
        <div className="relative z-10 text-center rounded-2xl border border-dashed border-blue-200 bg-gradient-to-b from-blue-50/50 to-white py-16">
          <p className="text-slate-500 text-sm">No entries yet.</p>
          <p className="text-slate-500 text-xs mt-1">
            Tap &quot;Add Entry&quot; above to start building this part of your vault.
          </p>
        </div>
      ) : (
        <div className="relative z-10 space-y-3">
          {entries.map((entry) => (
            <MindVaultEntryCard
              key={entry.id}
              entry={entry}
              onDelete={handleDeleteEntry}
            />
          ))}
        </div>
      )}
    </div>
  );
}
