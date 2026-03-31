'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
      // Reload entries
      const reload = await mindVaultService.getEntriesByCategory(user.id, categorySlug);
      if (reload.success && reload.data) {
        setEntries(reload.data);
      }
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
        <h1 className="text-2xl font-bold text-gray-900">{categoryInfo.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{categoryInfo.description}</p>
      </div>

      {/* Add Entry Form */}
      <div className="mb-6">
        <MindVaultEntryForm
          onSubmit={handleAddEntry}
          placeholder={`What would you like to add to ${categoryInfo.shortName}?`}
        />
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">No entries yet.</p>
          <p className="text-gray-400 text-xs mt-1">
            Tap &quot;Add Entry&quot; above to start building this part of your vault.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
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
