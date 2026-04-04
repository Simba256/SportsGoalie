'use client';

import { GoalieCategorySlug, GOALIE_CATEGORIES } from '@/types';
import { ChevronRight, Heart, Brain, Clock, Target, MessageCircle, Dumbbell, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const CATEGORY_COLORS: Record<string, { gradient: string; border: string; text: string; bg: string; ring: string }> = {
  feelings: {
    gradient: 'from-purple-500 to-pink-500',
    border: 'border-purple-200',
    text: 'text-purple-600',
    bg: 'bg-purple-100',
    ring: 'ring-purple-300',
  },
  knowledge: {
    gradient: 'from-blue-500 to-indigo-500',
    border: 'border-blue-200',
    text: 'text-blue-600',
    bg: 'bg-blue-100',
    ring: 'ring-blue-300',
  },
  pre_game: {
    gradient: 'from-cyan-500 to-teal-500',
    border: 'border-cyan-200',
    text: 'text-cyan-600',
    bg: 'bg-cyan-100',
    ring: 'ring-cyan-300',
  },
  in_game: {
    gradient: 'from-red-500 to-orange-500',
    border: 'border-red-200',
    text: 'text-red-600',
    bg: 'bg-red-100',
    ring: 'ring-red-300',
  },
  post_game: {
    gradient: 'from-green-500 to-emerald-500',
    border: 'border-green-200',
    text: 'text-green-600',
    bg: 'bg-green-100',
    ring: 'ring-green-300',
  },
  training: {
    gradient: 'from-orange-500 to-amber-500',
    border: 'border-orange-200',
    text: 'text-orange-600',
    bg: 'bg-orange-100',
    ring: 'ring-orange-300',
  },
  learning: {
    gradient: 'from-indigo-500 to-violet-500',
    border: 'border-indigo-200',
    text: 'text-indigo-600',
    bg: 'bg-indigo-100',
    ring: 'ring-indigo-300',
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
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center">
        {/* Progress dots */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            {Array.from({ length: totalCategories }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === categoryIndex
                    ? `${colors.bg} ring-2 ring-offset-2 ring-offset-white ${colors.ring}`
                    : i < categoryIndex
                    ? 'bg-green-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-400">
            Category {categoryIndex + 1} of {totalCategories}
          </p>
        </div>

        {/* Category icon */}
        <div className="mb-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${colors.gradient} shadow-lg`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Category name */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          {categoryName}
        </h1>

        {/* Weight indicator */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-sm font-medium mb-6`}>
          {weight}% of your profile
        </div>

        {/* Description */}
        <p className="text-lg text-gray-500 mb-6">
          {categoryDescription}
        </p>

        {/* Educational tooltip */}
        {tooltip && (
          <div className={`p-4 rounded-xl ${colors.bg} ${colors.border} border text-left mb-8`}>
            <p className="text-sm text-gray-600">
              {tooltip}
            </p>
          </div>
        )}

        {/* Question count */}
        <p className="text-gray-400 mb-8">
          {questionCount} question{questionCount !== 1 ? 's' : ''} in this category
        </p>

        {/* Start button */}
        <Button
          size="lg"
          onClick={onStart}
          className={`bg-gradient-to-r ${colors.gradient} text-white font-semibold px-10 py-6 text-lg rounded-xl shadow-lg transition-all hover:scale-105`}
        >
          Start Category
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
