'use client';

import { useState, useEffect } from 'react';
import { Sport, PILLARS } from '@/types';
import { sportsService } from '@/lib/database/services/sports.service';
import { getPillarSlugFromDocId } from '@/lib/utils/pillars';
import { SkeletonPillarsPage } from '@/components/ui/skeletons';
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
    return <SkeletonPillarsPage />;
  }

  return (
    <div className="bg-gray-50">

      {/* ══════════════════ HERO BANNER ══════════════════ */}
      <section
        className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 h-[500px] flex items-center justify-center text-center px-4 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514511719-9f5849dc16d0?w=1920&q=80&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-gray-100" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-gray-100/55 to-gray-50" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-white/5 backdrop-blur-[1px]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-white/10 backdrop-blur-[3px]" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-white/15 backdrop-blur-[6px]" />

        <div className="relative z-10 max-w-3xl mx-auto -mt-12 md:-mt-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            The Architecture of
            <br />
            a Complete Goalie
          </h1>

          <p className="text-base md:text-lg text-gray-200 leading-relaxed font-light px-4">
            Every pillar connects to every other. Master all seven and you
            master the game - physically, mentally, and technically.
            <br className="hidden md:block" />
            Each one builds on the last.
          </p>
        </div>
      </section>

      <main className="relative z-20 max-w-6xl mx-auto px-4 pb-24 -mt-24">

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
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {state.pillars.map((pillar) => {
              const { icon, color, slug } = getPillarDisplayInfo(pillar);
              const theme = PILLAR_THEME[color] ?? PILLAR_THEME['blue'];
              const IconComponent = PILLAR_ICONS[icon] ?? Target;
              const description =
                (slug && PILLAR_DESCRIPTIONS[slug]) ?? pillar.description;

              return (
                <Link key={pillar.id} href={`/pillars/${pillar.id}`} className="group h-full block">
                  <article className={`bg-white rounded-2xl p-8 border border-gray-100 flex flex-col transition-transform duration-300 hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${theme.borderHover}`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 flex items-center justify-center text-blue-600">
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <span className={`inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${theme.badgeClass}`}>
                        Pillar {String(pillar.order).padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {pillar.name}
                    </h3>

                    <p className="text-gray-600 mb-8 flex-grow leading-relaxed line-clamp-4">
                      {description}
                    </p>

                    <span className={`inline-flex items-center text-base font-semibold transition-colors ${theme.ctaClass}`}>
                      Explore Pillar
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </span>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      </main>

    </div>
  );
}
