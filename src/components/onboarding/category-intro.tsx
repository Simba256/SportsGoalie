'use client';

import { GoalieCategorySlug, GOALIE_CATEGORIES } from '@/types';
import { ChevronRight, Heart, Brain, Clock, Target, MessageCircle, Dumbbell, BookOpen, CheckCircle } from 'lucide-react';

interface CategoryIntroProps {
  categorySlug: GoalieCategorySlug;
  categoryName: string;
  categoryDescription: string;
  questionCount: number;
  categoryIndex: number;
  totalCategories: number;
  onStart: () => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  feelings: Heart,
  knowledge: Brain,
  pre_game: Clock,
  in_game: Target,
  post_game: MessageCircle,
  training: Dumbbell,
  learning: BookOpen,
};

const CATEGORY_COLORS: Record<string, {
  gradient: string;
  border: string;
  text: string;
  bg: string;
  ring: string;
}> = {
  feelings: {
    gradient: 'from-slate-700 to-slate-900',
    border: 'border-slate-200',
    text: 'text-slate-700',
    bg: 'bg-slate-100',
    ring: 'ring-slate-400',
  },
  knowledge: {
    gradient: 'from-blue-500 to-blue-700',
    border: 'border-blue-200',
    text: 'text-blue-700',
    bg: 'bg-blue-50',
    ring: 'ring-blue-400',
  },
  pre_game: {
    gradient: 'from-blue-700 to-slate-800',
    border: 'border-blue-200',
    text: 'text-blue-800',
    bg: 'bg-blue-50',
    ring: 'ring-blue-500',
  },
  in_game: {
    gradient: 'from-red-600 to-red-800',
    border: 'border-red-200',
    text: 'text-red-700',
    bg: 'bg-red-50',
    ring: 'ring-red-400',
  },
  post_game: {
    gradient: 'from-zinc-600 to-zinc-800',
    border: 'border-zinc-200',
    text: 'text-zinc-700',
    bg: 'bg-zinc-100',
    ring: 'ring-zinc-400',
  },
  training: {
    gradient: 'from-red-500 to-slate-700',
    border: 'border-red-200',
    text: 'text-red-700',
    bg: 'bg-red-50',
    ring: 'ring-red-400',
  },
  learning: {
    gradient: 'from-slate-800 to-blue-900',
    border: 'border-slate-200',
    text: 'text-slate-700',
    bg: 'bg-slate-100',
    ring: 'ring-slate-400',
  },
};

const CATEGORY_TOOLTIPS: Record<string, string> = {
  feelings: "Goaltending starts in your head before it ever reaches your body. How you feel about the position, how you handle pressure, how you bounce back — this is where development begins.",
  knowledge: "No wrong answers here. This helps Smarter Goalie know where to start with your learning.",
  pre_game: "The game doesn't start when the puck drops — it starts long before that. How you prepare at home, in the car, in the dressing room, and during warm-up all set the stage for how you'll perform.",
  in_game: "Competing as a goalie isn't just about trying hard. It's about how you see the puck, how you read the play, and how your eyes, mind, and body work together.",
  post_game: "How you process your performance after a game can be just as important as the game itself.",
  training: "The best goalies develop habits and routines that help them improve even when they're not on the ice.",
  learning: "This helps us show you content in the way that works best for you.",
};

export function CategoryIntro({
  categorySlug,
  categoryName,
  categoryDescription,
  questionCount,
  categoryIndex,
  totalCategories,
  onStart,
}: CategoryIntroProps) {
  const Icon = CATEGORY_ICONS[categorySlug] || Target;
  const colors = CATEGORY_COLORS[categorySlug] || CATEGORY_COLORS.knowledge;
  const tooltip = CATEGORY_TOOLTIPS[categorySlug] || '';

  const categoryInfo = GOALIE_CATEGORIES.find(c => c.slug === categorySlug);
  const weight = categoryInfo?.weight || 0;

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">

        {/* ── Category dots tracker ─────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalCategories }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              {i < categoryIndex ? (
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-200">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              ) : i === categoryIndex ? (
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-md ring-2 ring-offset-2 ring-offset-white ${colors.ring}`}>
                  <span className="text-[10px] font-black text-white">{i + 1}</span>
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-zinc-400">{i + 1}</span>
                </div>
              )}
              {i < totalCategories - 1 && (
                <div className={`h-0.5 w-4 rounded-full ${i < categoryIndex ? 'bg-emerald-400' : 'bg-zinc-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Main card ────────────────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden border border-zinc-200 shadow-xl shadow-zinc-200/60 bg-white">

          {/* Card header — gradient hero */}
          <div className={`relative bg-gradient-to-br ${colors.gradient} px-8 pt-10 pb-12 overflow-hidden text-center`}>
            {/* Decorative glow blobs */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            {/* Icon */}
            <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg mb-4">
              <Icon className="w-10 h-10 text-white" />
            </div>

            {/* Category label */}
            <div className="relative z-10">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-white/70 mb-2">
                Category {categoryIndex + 1} of {totalCategories}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                {categoryName}
              </h1>
              <p className="text-white/80 text-base leading-relaxed max-w-md mx-auto">
                {categoryDescription}
              </p>
            </div>
          </div>

          {/* Card body */}
          <div className="px-8 py-6 space-y-5">

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-2xl p-4 ${colors.bg} ${colors.border} border text-center`}>
                <p className={`text-2xl font-black ${colors.text}`}>{questionCount}</p>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">Questions</p>
              </div>
              <div className={`rounded-2xl p-4 ${colors.bg} ${colors.border} border text-center`}>
                <p className={`text-2xl font-black ${colors.text}`}>{weight}%</p>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">Profile Weight</p>
              </div>
            </div>

            {/* Insight box */}
            {tooltip && (
              <div className="flex gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className={`w-1 flex-shrink-0 rounded-full bg-gradient-to-b ${colors.gradient}`} />
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {tooltip}
                </p>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={onStart}
              className={`w-full py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r ${colors.gradient} shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2`}
            >
              Start Category
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Foot note */}
            <p className="text-center text-xs text-zinc-400">
              No right or wrong answers — answer honestly for the best results
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
