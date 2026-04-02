'use client';

import { useEffect, useState } from 'react';
import { Shield, Loader2, Sparkles } from 'lucide-react';
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
  const activeCategories = summaries.filter((s) => s.entryCount > 0).length;
  const coreEntries =
    (getSummary('acceptance')?.entryCount || 0) +
    (getSummary('cannot_accept')?.entryCount || 0);
  const momentum = Math.round((activeCategories / MIND_VAULT_CATEGORIES.length) * 100) || 0;

  return (
    <div className="relative max-w-7xl mx-auto overflow-hidden rounded-3xl border border-blue-100/80 bg-gradient-to-b from-white via-blue-50/20 to-white p-5 shadow-[0_24px_60px_-40px_rgba(14,116,244,0.35)] sm:p-8">
      <div className="pointer-events-none absolute -top-20 -right-20 h-52 w-52 rounded-full bg-blue-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-red-400/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 mb-8 overflow-hidden rounded-3xl border border-blue-200/70 bg-white/95 p-6 shadow-lg shadow-blue-500/10 backdrop-blur sm:p-7">
        <div className="pointer-events-none absolute -top-10 -right-8 h-36 w-36 rounded-full bg-blue-300/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-red-300/15 blur-2xl" />

        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-red-500 shadow-lg shadow-blue-500/30">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
              <Sparkles className="h-3 w-3" />
              Mindset Engine
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Mind Vault
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Build your mental armor with entries that keep you grounded, focused, and resilient.
            </p>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">Total Entries</p>
            <p className="mt-1 text-2xl font-bold text-blue-900">
              {loading ? '--' : totalEntries}
            </p>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-red-700">Core List Entries</p>
            <p className="mt-1 text-2xl font-bold text-red-900">
              {loading ? '--' : coreEntries}
            </p>
          </div>
        </div>

        <div className="relative mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-600">Vault Momentum</span>
            <span className="font-bold text-blue-700">{loading ? '--' : `${momentum}%`}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-red-500 transition-all duration-500"
              style={{ width: `${loading ? 8 : Math.max(momentum, 8)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
          Expandable Index
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Start with the core lists, then keep adding entries as new challenges appear. The vault
          expands over time and becomes your personal mental armor.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Featured: Acceptance & Cannot Accept */}
          <div className="relative z-10 mb-8">
            <h2 className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700">
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
          <div className="relative z-10">
            <h2 className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
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
