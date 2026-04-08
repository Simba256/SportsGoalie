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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-red-100/80 via-white to-blue-100/70 border border-red-200/60 p-6 md:p-8 overflow-hidden shadow-xl shadow-red-200/30">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-red-200/15 rounded-full blur-2xl" />

        <div className="relative flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Mind Vault</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" />
                Mindset Engine
              </span>
            </div>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed sm:text-base">
              Build your mental armor with entries that keep you grounded, focused, and resilient.
            </p>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Total Entries</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {loading ? '--' : totalEntries}
            </p>
          </div>
          <div className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">Core List Entries</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {loading ? '--' : coreEntries}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground">Momentum</span>
              <span className="font-bold text-primary">{loading ? '--' : `${momentum}%`}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${loading ? 8 : Math.max(momentum, 8)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Expandable Index
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
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
          <div className="mb-6">
            <h2 className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
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
            <h2 className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
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
