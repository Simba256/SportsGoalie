'use client';

import { useEffect, useState } from 'react';
import { dynamicChartingService, formTemplateService } from '@/lib/database';
import { templatesById } from '@/lib/charting/check-ins';
import type { DynamicChartingEntry, FormTemplate } from '@/types';

export interface PillarCheckIns {
  entries: DynamicChartingEntry[];
  /** The charts the check-ins were answered on, by template id. */
  templates: Record<string, FormTemplate>;
  loading: boolean;
  /** Reads the check-ins again, for a page with a Refresh button. */
  reload: () => void;
}

type Loaded = Omit<PillarCheckIns, 'reload' | 'loading'>;

const NOTHING: Loaded = { entries: [], templates: {} };

async function loadCheckIns(studentId: string | undefined): Promise<Loaded> {
  // Entries are read by a query on studentId, which the rules allow for any signed-in
  // user. A coach cannot read one entry by its id (admin or owner only), so nothing here does.
  const [entriesResult, templatesResult] = await Promise.all([
    studentId
      ? dynamicChartingService.getDynamicEntriesByStudent(studentId)
      : dynamicChartingService.getAllDynamicEntries({ limit: 1000 }),
    // Templates are listed rather than fetched one by one: a coach may only read a single
    // template that is active and not archived, but may list all of them.
    formTemplateService.getTemplates(),
  ]);

  const entries = entriesResult.success ? entriesResult.data ?? [] : [];
  const templates = templatesById(templatesResult.success ? templatesResult.data ?? [] : []);

  // A chart missing from the list (for example one with no createdAt) gets one more try.
  const missing = Array.from(new Set(entries.map((e) => e.formTemplateId))).filter((id) => !templates[id]);
  const retried = await Promise.all(missing.map((id) => formTemplateService.getTemplate(id)));
  retried.forEach((result, i) => {
    if (result.success && result.data) templates[missing[i]] = result.data;
  });

  return { entries, templates };
}

/**
 * Pillar check-ins for one goalie, or for every goalie when no id is given.
 * These are saved apart from logged sessions, so the session-based charting
 * pages never see them without this.
 */
export function usePillarCheckIns(studentId?: string): PillarCheckIns {
  const [result, setResult] = useState<{ key: string; loaded: Loaded } | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  // Which read the result belongs to; a result from an earlier goalie or reload counts as still loading.
  const key = `${studentId ?? ''}#${reloadCount}`;

  useEffect(() => {
    let cancelled = false;
    loadCheckIns(studentId)
      .then((loaded) => {
        if (!cancelled) setResult({ key, loaded });
      })
      .catch((err) => {
        console.error('Failed to load pillar check-ins', err);
        if (!cancelled) setResult({ key, loaded: NOTHING });
      });
    return () => {
      cancelled = true;
    };
  }, [studentId, key]);

  const current = result?.key === key ? result.loaded : NOTHING;
  return { ...current, loading: result?.key !== key, reload: () => setReloadCount((n) => n + 1) };
}
