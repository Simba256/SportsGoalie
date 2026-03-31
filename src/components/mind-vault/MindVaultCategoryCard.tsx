'use client';

import Link from 'next/link';
import {
  Heart, ShieldAlert, Mountain, Lightbulb, Quote,
  Wrench, Anchor, Trophy, Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { MindVaultCategoryInfo, MindVaultCategorySummary } from '@/types/mind-vault';

const ICON_MAP: Record<string, React.ElementType> = {
  Heart, ShieldAlert, Mountain, Lightbulb, Quote,
  Wrench, Anchor, Trophy, Users,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  red:     { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200' },
  yellow:  { bg: 'bg-yellow-50',  text: 'text-yellow-600',  border: 'border-yellow-200' },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200' },
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-200' },
  cyan:    { bg: 'bg-cyan-50',    text: 'text-cyan-600',    border: 'border-cyan-200' },
  pink:    { bg: 'bg-pink-50',    text: 'text-pink-600',    border: 'border-pink-200' },
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
      <Card className={`group cursor-pointer border ${colors.border} hover:shadow-md transition-all duration-200`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`h-5 w-5 ${colors.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm group-hover:text-gray-700 transition-colors">
                {category.name}
              </h3>
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
