'use client';

import Link from 'next/link';
import {
  Heart, ShieldAlert, Mountain, Lightbulb, Quote,
  Wrench, Anchor, Trophy, Users, ArrowUpRight,
} from 'lucide-react';
import type { MindVaultCategoryInfo, MindVaultCategorySummary } from '@/types/mind-vault';

const ICON_MAP: Record<string, React.ElementType> = {
  Heart, ShieldAlert, Mountain, Lightbulb, Quote,
  Wrench, Anchor, Trophy, Users,
};

const COLOR_MAP: Record<string, { text: string }> = {
  emerald: { text: 'text-blue-500' },
  red: { text: 'text-red-500' },
  amber: { text: 'text-blue-400' },
  yellow: { text: 'text-blue-500' },
  purple: { text: 'text-blue-500' },
  blue: { text: 'text-blue-500' },
  indigo: { text: 'text-blue-500' },
  cyan: { text: 'text-blue-400' },
  pink: { text: 'text-red-400' },
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
    <Link
      href={href}
      className="group block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden"
    >
      <div className="mb-3">
        <Icon className={`h-6 w-6 ${colors.text}`} />
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">{category.name}</h3>
      <p className="text-sm text-gray-600 mb-10 line-clamp-2">{category.description}</p>

      <div className="absolute bottom-0 left-0 right-0 px-5 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between group-hover:bg-gray-100 transition-colors">
        <span className="text-xs font-semibold text-gray-700">
          {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
        </span>
        <ArrowUpRight className="h-4 w-4 text-gray-400 text-xs group-hover:text-gray-600" />
      </div>
    </Link>
  );
}
