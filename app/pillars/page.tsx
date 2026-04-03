'use client';

import { useState, useEffect } from 'react';
import { Sport, PILLARS } from '@/types';
import { sportsService } from '@/lib/database/services/sports.service';
import { getPillarSlugFromDocId } from '@/lib/utils/pillars';
import { GradientCard } from '@/components/ui/gradient-card';
import { LoadingState } from '@/components/ui/loading';
import Link from 'next/link';
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

// ─── Pillar colour → GradientCard config ─────────────────────────────────────
const PILLAR_THEME: Record<
  string,
  {
    gradient: 'red' | 'lightBlue' | 'darkBlue' | 'gray' | 'dark';
    badgeColor: string;
    numberColor: string;
  }
> = {
  // Requested distribution: 2 red, 1 light blue, 2 dark blue, 1 grey, 1 black
  purple: { gradient: 'dark', badgeColor: '#BFDBFE', numberColor: 'text-zinc-300' },
  blue:   { gradient: 'darkBlue', badgeColor: '#93C5FD', numberColor: 'text-blue-300' },
  green:  { gradient: 'lightBlue', badgeColor: '#7DD3FC', numberColor: 'text-sky-300' },
  orange: { gradient: 'gray', badgeColor: '#9CA3AF', numberColor: 'text-gray-300' },
  red:    { gradient: 'red',  badgeColor: '#F87171', numberColor: 'text-red-300' },
  cyan:   { gradient: 'darkBlue', badgeColor: '#60A5FA', numberColor: 'text-blue-300' },
  pink:   { gradient: 'red',  badgeColor: '#FB7185', numberColor: 'text-red-300' },
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingState message="Loading your pillars…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-12 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-zinc-900 leading-[1.05] tracking-tight mb-6">
            The Architecture of a{' '}
            <span className="text-blue-500">
              Complete Goalie
            </span>
          </h1>
          <p className="text-zinc-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Every pillar connects to every other. Master all seven and you master
            the game — physically, mentally, and technically. Each one builds on the last.
          </p>
        </div>
      </section>

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      {state.error && (
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <p className="text-red-700 font-medium mb-4">{state.error}</p>
            <button
              onClick={loadPillars}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-500 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {!state.error && state.pillars.length === 0 && (
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Pillars coming soon</h3>
          <p className="text-gray-500">The curriculum is being built. Check back shortly.</p>
        </div>
      )}

      {/* ── Pillar Cards ────────────────────────────────────────────────────── */}
      {state.pillars.length > 0 && (
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.pillars.map((pillar) => {
                const { icon, color, slug } = getPillarDisplayInfo(pillar);
                const theme = PILLAR_THEME[color] ?? PILLAR_THEME['blue'];
                const IconComponent = PILLAR_ICONS[icon] ?? Target;
                const description =
                  (slug && PILLAR_DESCRIPTIONS[slug]) ?? pillar.description;

                return (
                  <Link key={pillar.id} href={`/pillars/${pillar.id}`} className="h-full block">
                    <GradientCard
                      gradient={theme.gradient}
                      badgeText={`Pillar ${String(pillar.order).padStart(2, '0')}`}
                      badgeColor={theme.badgeColor}
                      title={pillar.name}
                      description={description}
                      ctaText="Explore Pillar"
                      ctaHref={`/pillars/${pillar.id}`}
                      className="h-full"
                      decorativeElement={
                        <IconComponent
                          className="w-44 h-44"
                          style={{ color: theme.badgeColor }}
                          strokeWidth={1.2}
                        />
                      }
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom callout ──────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-red-600 font-bold tracking-widest uppercase text-xs mb-3">
            How It Works
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 mb-4">
            Everything Connects
          </h2>
          <p className="text-zinc-600 max-w-2xl mx-auto text-base leading-relaxed mb-8">
            Chart the game, train what matters, and build confidence for your next performance.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-3 text-xs font-semibold text-zinc-700">
            <span className="bg-zinc-100 px-4 py-2 rounded-full">Chart</span>
            <span className="text-zinc-400">→</span>
            <span className="bg-zinc-100 px-4 py-2 rounded-full">Learn</span>
            <span className="text-zinc-400">→</span>
            <span className="bg-zinc-100 px-4 py-2 rounded-full">Apply</span>
            <span className="text-zinc-400">→</span>
            <span className="bg-zinc-100 px-4 py-2 rounded-full">Perform Better</span>
          </div>
        </div>
      </section>

    </div>
  );
}
