'use client';

import { useState, useEffect } from 'react';
import { Sport, PILLARS } from '@/types';
import { sportsService } from '@/lib/database/services/sports.service';
import { getPillarSlugFromDocId } from '@/lib/utils/pillars';
import { LoadingState } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Brain,
  Footprints,
  Shapes,
  Target,
  Grid3X3,
  Dumbbell,
  Heart,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

// ─── Per-pillar visual theme ──────────────────────────────────────────────────
const PILLAR_THEME: Record<
  string,
  {
    badgeClass: string;
    iconBg: string;
    iconText: string;
    ctaClass: string;
    dotColors: [string, string, string];
    borderHover: string;
  }
> = {
  purple: {
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    ctaClass: 'text-blue-600 group-hover:text-blue-700',
    dotColors: ['bg-blue-400', 'bg-blue-300', 'bg-slate-300'],
    borderHover: 'hover:border-blue-300',
  },
  blue: {
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    ctaClass: 'text-blue-600 group-hover:text-blue-700',
    dotColors: ['bg-blue-500', 'bg-blue-300', 'bg-slate-300'],
    borderHover: 'hover:border-blue-300',
  },
  green: {
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    ctaClass: 'text-blue-600 group-hover:text-blue-700',
    dotColors: ['bg-blue-400', 'bg-blue-300', 'bg-slate-300'],
    borderHover: 'hover:border-blue-300',
  },
  orange: {
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    ctaClass: 'text-blue-600 group-hover:text-blue-700',
    dotColors: ['bg-blue-400', 'bg-blue-300', 'bg-slate-300'],
    borderHover: 'hover:border-blue-300',
  },
  red: {
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    ctaClass: 'text-blue-600 group-hover:text-blue-700',
    dotColors: ['bg-blue-400', 'bg-blue-300', 'bg-slate-300'],
    borderHover: 'hover:border-blue-300',
  },
  cyan: {
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    ctaClass: 'text-blue-600 group-hover:text-blue-700',
    dotColors: ['bg-blue-500', 'bg-blue-300', 'bg-slate-300'],
    borderHover: 'hover:border-blue-300',
  },
  pink: {
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    ctaClass: 'text-blue-600 group-hover:text-blue-700',
    dotColors: ['bg-blue-400', 'bg-blue-300', 'bg-slate-300'],
    borderHover: 'hover:border-blue-300',
  },
};

// Icon map
const PILLAR_ICONS: Record<string, React.ElementType> = {
  Brain, Footprints, Shapes, Target, Grid3X3, Dumbbell, Heart,
};

// Descriptions that match the client's documented content
const PILLAR_DESCRIPTIONS: Record<string, string> = {
  mindset:     'Build your mental fortress. Learn why your brain does what it does and how to redirect anxiety into performance energy.',
  skating:     'Move with precision and purpose. Master edgework, lateral speed, and efficiency of movement in sync with the play.',
  form:        'Perfect your physical foundation. Stance, paddle control, and body mechanics — the blueprint of every great save.',
  positioning: 'See the ice geometrically. The 7 Angle-Mark System gives you a mathematical grid to always be in the right spot.',
  seven_point: 'Own the danger zone. The 7 Point System addresses below-the-icing-line positioning — the most dangerous area on ice.',
  training:    'Make every rep count. Chart your games, spot your patterns, and translate practice directly into game performance.',
  lifestyle:   'Train the whole athlete. Off-ice habits, nutrition, recovery, and sleep are the foundation your on-ice game builds on.',
};

interface PillarsPageState {
  pillars: Sport[];
  loading: boolean;
  error: string | null;
}

export default function PillarsPage() {
  const [state, setState] = useState<PillarsPageState>({
    pillars: [],
    loading: true,
    error: null,
  });

  const loadPillars = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await sportsService.getAllSports({ limit: 10 });
      if (result.success && result.data) {
        setState({
          pillars: result.data.items.sort((a, b) => a.order - b.order),
          loading: false,
          error: null,
        });
      } else {
        setState({ pillars: [], loading: false, error: result.error?.message || 'Failed to load pillars' });
      }
    } catch {
      setState({ pillars: [], loading: false, error: 'An unexpected error occurred' });
    }
  };

  useEffect(() => { loadPillars(); }, []);

  const getPillarDisplayInfo = (pillar: Sport) => {
    const slug = getPillarSlugFromDocId(pillar.id);
    if (slug) {
      const info = PILLARS.find(p => p.slug === slug);
      if (info) return { icon: info.icon, color: info.color, slug };
    }
    return { icon: pillar.icon, color: 'blue', slug: null };
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingState message="Loading your pillars…" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ══════════════════ HERO BANNER ══════════════════ */}
      <section
        className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 rounded-b-none overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514511719-9f5849dc16d0?w=1920&q=80&auto=format&fit=crop')" }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/80" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-10 md:py-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight max-w-4xl">
            The Architecture of a{' '}
            <span className="text-red-500">Complete Goalie</span>
          </h1>

          <p className="mt-4 text-sm md:text-base text-white/80 max-w-2xl leading-relaxed">
            Every pillar connects to every other.{' '}
            <span className="font-semibold text-white">
              Master all seven and you master the game —
              physically, mentally, and technically.
            </span>{' '}
            Each one builds on the last.
          </p>

          {/* Accent divider */}
          <div className="mt-4 h-1 w-14 rounded-full bg-blue-500" />
        </div>
      </section>

      {/* ══════════════════ ERROR STATE ══════════════════ */}
      {state.error && (
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8">
            <p className="text-destructive font-medium mb-4">{state.error}</p>
            <Button onClick={loadPillars} variant="destructive" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" /> Try Again
            </Button>
          </div>
        </div>
      )}

      {/* ══════════════════ EMPTY STATE ══════════════════ */}
      {!state.error && state.pillars.length === 0 && (
        <div className="max-w-2xl mx-auto py-20 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Pillars coming soon</h3>
          <p className="text-muted-foreground">The curriculum is being built. Check back shortly.</p>
        </div>
      )}

      {/* ══════════════════ PILLAR CARDS ══════════════════ */}
      {state.pillars.length > 0 && (
        <section className="max-w-7xl mx-auto px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {state.pillars.map((pillar) => {
              const { icon, color, slug } = getPillarDisplayInfo(pillar);
              const theme = PILLAR_THEME[color] ?? PILLAR_THEME['blue'];
              const IconComponent = PILLAR_ICONS[icon] ?? Target;
              const description =
                (slug && PILLAR_DESCRIPTIONS[slug]) ?? pillar.description;

              return (
                <Link key={pillar.id} href={`/pillars/${pillar.id}`} className="group h-full block">
                  <article className={`relative h-full min-h-[340px] rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60 ${theme.borderHover}`}>
                    {/* Top row: Icon + Badge + Arrow */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Colored icon circle */}
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${theme.iconBg}`}>
                          <IconComponent className={`h-5 w-5 ${theme.iconText}`} strokeWidth={2} />
                        </div>

                        {/* Badge */}
                        <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] ${theme.badgeClass}`}>
                          Pillar {String(pillar.order).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Arrow */}
                      <div className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-all duration-300 group-hover:border-slate-300 group-hover:text-slate-600 group-hover:bg-slate-50">
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-foreground leading-snug mb-2">
                      {pillar.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-muted-foreground mb-6 line-clamp-4">
                      {description}
                    </p>

                    {/* Bottom row: Dots + CTA */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${theme.dotColors[0]}`} />
                        <span className={`h-2.5 w-2.5 rounded-full ${theme.dotColors[1]}`} />
                        <span className={`h-2.5 w-2.5 rounded-full ${theme.dotColors[2]}`} />
                      </div>

                      <span className={`inline-flex items-center gap-1 text-sm font-semibold transition-colors ${theme.ctaClass}`}>
                        Explore Pillar
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════════ BOTTOM CALLOUT ══════════════════ */}
      <section className="max-w-7xl mx-auto rounded-2xl border border-border/60 bg-card p-6 md:p-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-accent font-bold tracking-widest uppercase text-xs mb-3">
            How It Works
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Everything Connects
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed mb-6">
            Chart the game, train what matters, and build confidence for your next performance.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-3 text-xs font-semibold text-foreground/80">
            <span className="bg-muted px-4 py-2 rounded-full">Chart</span>
            <span className="text-muted-foreground">→</span>
            <span className="bg-muted px-4 py-2 rounded-full">Learn</span>
            <span className="text-muted-foreground">→</span>
            <span className="bg-muted px-4 py-2 rounded-full">Apply</span>
            <span className="text-muted-foreground">→</span>
            <span className="bg-muted px-4 py-2 rounded-full">Perform Better</span>
          </div>
        </div>
      </section>

    </div>
  );
}
