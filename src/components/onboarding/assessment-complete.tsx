'use client';

import { Button } from '@/components/ui/button';
import { ChevronRight, CheckCircle, Sparkles } from 'lucide-react';

interface AssessmentCompleteProps {
  studentName?: string;
  onContinue: () => void;
}

/**
 * Simple completion screen for students after assessment.
 * Does NOT show scores or intelligence profile - that's for coaches/admins only.
 */
export function AssessmentComplete({
  studentName = 'Goalie',
  onContinue,
}: AssessmentCompleteProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-lg mx-auto text-center">
        {/* Success icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center animate-bounce">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Great Job, {studentName}!
        </h1>

        {/* Message */}
        <p className="text-lg text-slate-300 mb-6 leading-relaxed">
          You've completed your initial assessment. Your coach will review your
          responses and work with you to create a personalized training plan.
        </p>

        <p className="text-slate-400 mb-8">
          In the meantime, you can explore the pillars and start learning at your own pace.
        </p>

        {/* Continue button */}
        <Button
          size="lg"
          onClick={onContinue}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold px-10 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
        >
          Go to Dashboard
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
