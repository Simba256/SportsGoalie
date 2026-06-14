'use client';

import Link from 'next/link';
import {
  Heart, ShieldAlert, Mountain, Lightbulb, Quote,
  Wrench, Anchor, Trophy, Users, ArrowUpRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { MindVaultCategoryInfo, MindVaultCategorySummary } from '@/types/mind-vault';

<<<<<<< HEAD
const ICON_MAP: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
=======
const ICON_MAP: Record<string, LucideIcon> = {
>>>>>>> e9f05073d0f740d46f1573caec2788d046b07e5d
  Heart, ShieldAlert, Mountain, Lightbulb, Quote,
  Wrench, Anchor, Trophy, Users,
};

const BLUE = '#37b5ff';

interface Props {
  category: MindVaultCategoryInfo;
  summary?: MindVaultCategorySummary;
}

export function MindVaultCategoryCard({ category, summary }: Props) {
  const Icon = ICON_MAP[category.icon] || Heart;
  const entryCount = summary?.entryCount || 0;

  const href =
    category.slug === 'acceptance'
      ? '/mind-vault/acceptance'
      : category.slug === 'cannot_accept'
      ? '/mind-vault/cannot-accept'
      : `/mind-vault/${category.slug}`;

  return (
    <Link
      href={href}
      style={{
        display: 'block',
        background: 'rgba(2,18,44,0.85)',
        borderRadius: '14px',
        padding: '20px',
        paddingBottom: '52px',
        border: '1px solid rgba(55,181,255,0.14)',
        position: 'relative',
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(55,181,255,0.32)';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(55,181,255,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(55,181,255,0.14)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <Icon style={{ width: '24px', height: '24px', color: BLUE }} />
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 6px 0' }}>
        {category.name}
      </h3>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, margin: 0 }}>
        {category.description}
      </p>

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '10px 20px',
        borderTop: '1px solid rgba(55,181,255,0.1)',
        background: 'rgba(0,8,24,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
          {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
        </span>
        <ArrowUpRight style={{ width: '14px', height: '14px', color: `rgba(55,181,255,0.6)` }} />
      </div>
    </Link>
  );
}
