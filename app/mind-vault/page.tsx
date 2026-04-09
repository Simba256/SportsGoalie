'use client';

import { useEffect, useState } from 'react';
import { SkeletonCardGrid } from '@/components/ui/skeletons';
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Banner */}
      <section
        className="relative -mx-4 -mt-4 overflow-hidden rounded-b-none bg-cover bg-center bg-no-repeat md:-mx-6 md:-mt-6"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/65 to-slate-900/85" />
        <div className="relative z-10 px-6 py-7 md:px-8 md:py-9">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-black leading-tight tracking-tight text-white md:text-4xl">
                Build the Mental Game,
                <span className="block text-red-500">One Entry at a Time.</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
                Build your mental armor with entries that keep you grounded, focused, and resilient.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">Total Entries</p>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {loading ? '--' : totalEntries}
          </p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-red-700">Core List Entries</p>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {loading ? '--' : coreEntries}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-500">Momentum</span>
            <span className="font-bold text-slate-900">{loading ? '--' : `${momentum}%`}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-red-500 transition-all duration-500"
              style={{ width: `${loading ? 8 : Math.max(momentum, 8)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-red-100/80 bg-gradient-to-r from-red-50/70 via-white to-blue-50/70 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
          Expandable Index
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Start with the core lists, then keep adding entries as new challenges appear. The vault
          expands over time and becomes your personal mental armor.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <SkeletonCardGrid count={2} cols={2} />
          <SkeletonCardGrid count={4} cols={3} />
        </div>
      ) : (
        <>
          {/* Featured: Acceptance & Cannot Accept */}
          <div className="mb-6">
            <h2 className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700">
              Core Lists
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
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
            <h2 className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
              All Categories
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
