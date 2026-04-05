'use client';

import { Button } from '@/components/ui/button';
import { ChevronRight, CheckCircle, Sparkles } from 'lucide-react';

interface ParentAssessmentCompleteProps {
  parentName?: string;
  onContinue: () => void;
}

export function ParentAssessmentComplete({
  parentName = 'Parent',
  onContinue,
}: ParentAssessmentCompleteProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-lg mx-auto text-center">
        {/* Success icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center animate-bounce">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Thank You, {parentName}!
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-500 mb-6 leading-relaxed">
          You&apos;ve completed your parent assessment. Your responses will be cross-referenced
          with your goalie&apos;s self-assessment to provide valuable insights into their development.
        </p>

        <p className="text-gray-400 mb-8">
          Head to your dashboard to link your goalie and start tracking their progress.
        </p>

        {/* Continue button */}
        <Button
          size="lg"
          onClick={onContinue}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-6 text-lg rounded-xl shadow-lg shadow-red-500/20 transition-all hover:scale-105"
        >
          Go to Dashboard
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
