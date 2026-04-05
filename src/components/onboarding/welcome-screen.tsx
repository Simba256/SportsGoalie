'use client';

import { Button } from '@/components/ui/button';
import { ChevronRight, Heart, Brain, Clock, Target, MessageCircle, Dumbbell, BookOpen } from 'lucide-react';

interface WelcomeScreenProps {
  studentName: string;
  onBegin: () => void;
}

const CATEGORIES = [
  { name: 'Feelings', icon: Heart, color: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
  { name: 'Knowledge', icon: Brain, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: 'Pre-Game', icon: Clock, color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { name: 'In-Game', icon: Target, color: 'bg-red-100 text-red-700 border-red-200' },
  { name: 'Post-Game', icon: MessageCircle, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Training', icon: Dumbbell, color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { name: 'Learning', icon: BookOpen, color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export function WelcomeScreen({ studentName, onBegin }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Welcome text */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
          Welcome, {studentName}!
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 mb-8 leading-relaxed">
          Before we begin your goaltending journey, let&apos;s discover where you are today.
          We&apos;ll start with a few quick questions about you, then explore{' '}
          <span className="text-red-500 font-semibold">7 areas of your game</span>.
        </p>

        {/* Category preview */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(({ name, icon: Icon, color }) => (
            <div
              key={name}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${color}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{name}</span>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-10 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">What to expect:</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>Quick intake questions to learn about you</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>28 assessment questions across 7 categories</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>All multiple choice — no right or wrong answers</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>Your personalized Intelligence Profile at the end</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>Progress is saved automatically</span>
            </li>
          </ul>
        </div>

        {/* Begin button */}
        <Button
          size="lg"
          onClick={onBegin}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-6 text-lg rounded-xl shadow-lg shadow-red-500/20 transition-all hover:scale-105"
        >
          Let&apos;s Get Started
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>

        <p className="mt-6 text-sm text-gray-400">
          Answer honestly — this helps us personalize your learning path.
        </p>
      </div>
    </div>
  );
}
