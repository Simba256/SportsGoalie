'use client';

import { Button } from '@/components/ui/button';
import { Shield, ChevronRight, Heart, Brain, Clock, Target, MessageCircle, Dumbbell, BookOpen } from 'lucide-react';

interface WelcomeScreenV2Props {
  studentName: string;
  onBegin: () => void;
}

/**
 * Category preview data
 */
const CATEGORIES = [
  { name: 'Feelings', icon: Heart, color: 'purple' },
  { name: 'Knowledge', icon: Brain, color: 'blue' },
  { name: 'Pre-Game', icon: Clock, color: 'cyan' },
  { name: 'In-Game', icon: Target, color: 'red' },
  { name: 'Post-Game', icon: MessageCircle, color: 'green' },
  { name: 'Training', icon: Dumbbell, color: 'orange' },
  { name: 'Learning', icon: BookOpen, color: 'indigo' },
];

const COLOR_CLASSES: Record<string, string> = {
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
  green: 'bg-green-500/20 text-green-300 border-green-500/30',
  orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
};

/**
 * V2 Welcome screen for the new onboarding flow.
 * Introduces the 7-category assessment system.
 */
export function WelcomeScreenV2({ studentName, onBegin }: WelcomeScreenV2Props) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30">
            <Shield className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Welcome text */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
          Welcome, {studentName}!
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed">
          Before we begin your goaltending journey, let's discover where you are today.
          We'll start with a few quick questions about you, then explore{' '}
          <span className="text-cyan-400 font-semibold">7 areas of your game</span>.
        </p>

        {/* Category preview */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(({ name, icon: Icon, color }) => (
            <div
              key={name}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${COLOR_CLASSES[color]}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{name}</span>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-10 text-left">
          <h3 className="font-semibold text-white mb-3">What to expect:</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Quick intake questions to learn about you</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>28 assessment questions across 7 categories</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>All multiple choice — no right or wrong answers</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Your personalized Intelligence Profile at the end</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Progress is saved automatically</span>
            </li>
          </ul>
        </div>

        {/* Begin button */}
        <Button
          size="lg"
          onClick={onBegin}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold px-10 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
        >
          Let's Get Started
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>

        <p className="mt-6 text-sm text-slate-500">
          Answer honestly — this helps us personalize your learning path.
        </p>
      </div>
    </div>
  );
}
