'use client';

import Link from 'next/link';
import {
  Heart, ShieldAlert, Mountain, Lightbulb, Quote,
  Wrench, Anchor, Trophy, Users, ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { MindVaultCategoryInfo, MindVaultCategorySummary } from '@/types/mind-vault';

const ICON_MAP: Record<string, React.ElementType> = {
  Heart, ShieldAlert, Mountain, Lightbulb, Quote,
  Wrench, Anchor, Trophy, Users,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  red:     { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200' },
  amber:   { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  yellow:  { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  purple:  { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  indigo:  { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  cyan:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  pink:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
};

interface Props {
  category: MindVaultCategoryInfo;
  summary?: MindVaultCategorySummary;
}

export function MindVaultCategoryCard({ category, summary }: Props) {
  const Icon = ICON_MAP[category.icon] || Heart;
  const colors = COLOR_MAP[category.color] || COLOR_MAP.blue;
  const entryCount = summary?.entryCount || 0;

  // Route acceptance/cannot_accept to their dedicated pages
  const href =
    category.slug === 'acceptance'
      ? '/mind-vault/acceptance'
      : category.slug === 'cannot_accept'
      ? '/mind-vault/cannot-accept'
      : `/mind-vault/${category.slug}`;

  return (
    <Link href={href}>
      <Card className={`group relative cursor-pointer overflow-hidden border ${colors.border} bg-white/95 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10`}>
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-blue-50/60 via-transparent to-red-50/40" />
        <CardContent className="p-5">
          <div className="relative z-10 flex items-start gap-4">
            <div className={`h-10 w-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0 border ${colors.border}`}>
              <Icon className={`h-5 w-5 ${colors.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-slate-700">
                {category.name}
                </h3>
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {category.description}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs font-medium ${colors.text}`}>
                  {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                </span>
                {summary?.lastUpdated && (
                  <span className="text-xs text-gray-400">
                    Last updated{' '}
                    {(summary.lastUpdated.toDate?.() || new Date(summary.lastUpdated as unknown as string)).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
