'use client';

import { Button } from '@/components/ui/button';
import { Users, ChevronRight, Eye, Brain, Clock, Car, Target, MessageCircle } from 'lucide-react';

interface ParentWelcomeScreenProps {
  parentName: string;
  onBegin: () => void;
}

const PARENT_CATEGORIES = [
  { name: 'Goalie State', icon: Eye, color: 'bg-purple-100 text-purple-600 border-purple-200' },
  { name: 'Understanding', icon: Brain, color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { name: 'Pre-Game', icon: Clock, color: 'bg-cyan-100 text-cyan-600 border-cyan-200' },
  { name: 'Car Ride Home', icon: Car, color: 'bg-amber-100 text-amber-600 border-amber-200' },
  { name: 'Development Role', icon: Users, color: 'bg-green-100 text-green-600 border-green-200' },
  { name: 'Expectations', icon: Target, color: 'bg-red-100 text-red-600 border-red-200' },
  { name: 'Preferences', icon: MessageCircle, color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
];

export function ParentWelcomeScreen({ parentName, onBegin }: ParentWelcomeScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500 shadow-lg shadow-red-500/20">
            <Users className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Welcome text */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
          Welcome, {parentName}!
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 mb-8 leading-relaxed">
          Help us understand your perspective on your goalie&apos;s development.
          We&apos;ll start with a few questions about your goalie, then explore{' '}
          <span className="text-red-500 font-semibold">7 areas</span> of how you see their game.
        </p>

        {/* Category preview */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {PARENT_CATEGORIES.map(({ name, icon: Icon, color }) => (
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
              <span>Quick intake questions about your goalie</span>
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
              <span>Your responses help us cross-reference with your goalie&apos;s self-assessment</span>
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
          Answer honestly — your perspective helps build a complete picture of your goalie&apos;s development.
        </p>
      </div>
    </div>
  );
}
