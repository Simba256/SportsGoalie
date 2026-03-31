'use client';

import { useEffect, useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { mindVaultService } from '@/lib/database/services/mind-vault.service';
import { MindVaultCategoryCard } from '@/components/mind-vault/MindVaultCategoryCard';
import {
  MIND_VAULT_CATEGORIES,
  type MindVaultCategorySummary,
} from '@/types/mind-vault';

export default function MindVaultPage() {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<MindVaultCategorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      const result = await mindVaultService.getCategorySummary(user.id);
      if (result.success && result.data) {
        setSummaries(result.data);
      }
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const getSummary = (slug: string) =>
    summaries.find((s) => s.category === slug);

  const totalEntries = summaries.reduce((sum, s) => sum + s.entryCount, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Shield className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mind Vault</h1>
            <p className="text-sm text-gray-500">
              Your personal mental safe — built by you, owned by you.
            </p>
          </div>
        </div>
        {!loading && totalEntries > 0 && (
          <p className="text-xs text-gray-400 mt-3 ml-[52px]">
            {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'} across{' '}
            {summaries.length} {summaries.length === 1 ? 'category' : 'categories'}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Featured: Acceptance & Cannot Accept */}
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Core Lists
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {MIND_VAULT_CATEGORIES.filter(
                (c) => c.slug === 'acceptance' || c.slug === 'cannot_accept'
              ).map((cat) => (
                <MindVaultCategoryCard
                  key={cat.slug}
                  category={cat}
                  summary={getSummary(cat.slug)}
                />
              ))}
            </div>
          </div>

          {/* Other Categories */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              All Categories
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MIND_VAULT_CATEGORIES.filter(
                (c) => c.slug !== 'acceptance' && c.slug !== 'cannot_accept'
              ).map((cat) => (
                <MindVaultCategoryCard
                  key={cat.slug}
                  category={cat}
                  summary={getSummary(cat.slug)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
