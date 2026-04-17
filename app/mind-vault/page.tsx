'use client';

import { useEffect, useState } from 'react';
import { SkeletonCardGrid } from '@/components/ui/skeletons';
import { useAuth } from '@/lib/auth/context';
import { mindVaultService } from '@/lib/database/services/mind-vault.service';
import { MindVaultCategoryCard } from '@/components/mind-vault/MindVaultCategoryCard';
import { Brain, ListChecks, Flame } from 'lucide-react';
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
  const safeMomentum = loading ? 0 : Math.max(momentum, 6);

  return (
    <div className="bg-gray-50">
      <section
        className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 h-[340px] md:h-[390px] flex flex-col items-center justify-center px-4 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/mind-vault.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-slate-900/75 to-red-900/65" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-gray-100/55 to-gray-50" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-white/5 backdrop-blur-[1px]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-white/10 backdrop-blur-[3px]" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-white/15 backdrop-blur-[6px]" />
        <div className="relative z-10 text-center flex flex-col items-center">
          <h1 className="text-white text-3xl md:text-5xl font-bold bg-white/10 border border-white/25 backdrop-blur-sm px-6 py-2 rounded-xl inline-block shadow-lg mb-2">
            Build the Mental Game
          </h1>
          <p className="text-white text-sm md:text-base font-medium drop-shadow-md">
            Your personal mental armor, expanded one entry at a time.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-12">
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-7 mb-10">
          <div className="rounded-2xl bg-blue-50 border border-blue-100 shadow-sm h-[190px] md:h-[200px]">
            <div className="relative p-6 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 leading-tight">Total Entries</p>
                <div className="w-9 h-9 rounded-lg bg-blue-100/80 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-5xl md:text-6xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                {loading ? '--' : totalEntries}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm h-[190px] md:h-[200px]">
            <div className="relative p-6 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 leading-tight">Core List Entries</p>
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ListChecks className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-5xl md:text-6xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                {loading ? '--' : coreEntries}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm h-[190px] md:h-[200px]">
            <div className="relative p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Momentum</p>
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-[30px] font-extrabold text-slate-900 mt-1 leading-none tracking-tight">
                {loading ? '--' : `${momentum}%`}
              </p>
              <div className="mt-auto">
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${safeMomentum}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 text-center font-medium">Keep your streak alive!</p>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="space-y-6">
            <SkeletonCardGrid count={2} cols={2} />
            <SkeletonCardGrid count={4} cols={2} />
          </div>
        ) : (
          <>
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Core Lists</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">All Categories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </section>
          </>
        )}
      </main>
    </div>
  );
}
