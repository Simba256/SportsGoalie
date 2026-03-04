'use client';

import { Button } from '@/components/ui/button';
import { Shield, ChevronRight } from 'lucide-react';

interface WelcomeScreenProps {
  studentName: string;
  onBegin: () => void;
}

/**
 * Initial welcome screen before starting the onboarding evaluation.
 */
export function WelcomeScreen({ studentName, onBegin }: WelcomeScreenProps) {
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
          This evaluation will assess your skills across the{' '}
          <span className="text-cyan-400 font-semibold">6 Ice Hockey Goalie Pillars</span>.
        </p>

        {/* Pillar preview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10 text-sm">
          <PillarPreview name="Mind-Set" color="purple" />
          <PillarPreview name="Skating" color="blue" />
          <PillarPreview name="Form" color="green" />
          <PillarPreview name="Positioning" color="orange" />
          <PillarPreview name="7 Point System" color="red" />
          <PillarPreview name="Training" color="cyan" />
        </div>

        {/* Info */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-10 text-left">
          <h3 className="font-semibold text-white mb-3">What to expect:</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>About 27 questions across 6 skill areas</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Mix of self-ratings, multiple choice, and video scenarios</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Takes approximately 10-15 minutes to complete</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Your progress is saved automatically</span>
            </li>
          </ul>
        </div>

        {/* Begin button */}
        <Button
          size="lg"
          onClick={onBegin}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold px-10 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
        >
          Begin Evaluation
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>

        <p className="mt-6 text-sm text-slate-500">
          Answer honestly — there are no wrong answers. This helps us personalize your training.
        </p>
      </div>
    </div>
  );
}

function PillarPreview({ name, color }: { name: string; color: string }) {
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    red: 'bg-red-500/20 text-red-300 border-red-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  };

  return (
    <div
      className={`px-3 py-2 rounded-lg border ${colorClasses[color] || colorClasses.blue}`}
    >
      {name}
    </div>
  );
}
